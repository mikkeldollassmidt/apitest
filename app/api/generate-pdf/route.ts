import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Lav PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 50px; line-height: 1.6; }
            h1 { color: #1f2937; }
            hr { margin: 30px 0; }
          </style>
        </head>
        <body>
          <h1>${data.title || 'Bogføring'}</h1>
          <p><strong>Kunde:</strong> ${data.name || 'Ukendt'}</p>
          <p><strong>Dato:</strong> ${new Date().toLocaleDateString('da-DK')}</p>
          <hr>
          <p>${data.description || ''}</p>
        </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // Upload til Supabase Storage
    const timestamp = Date.now();
    const safeTitle = (data.title || 'dokument').replace(/[^a-zA-Z0-9æøåÆØÅ-]/g, '-');
    const fileName = `pdfs/${timestamp}-${safeTitle}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(fileName, pdfBuffer, { contentType: 'application/pdf' });

    if (uploadError) throw new Error(`Upload fejl: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(fileName);

    // Gem i databasen
    const { error: dbError } = await supabase.from('pdf_list').insert({
      title: data.title || 'Bogføring',
      name: data.name || 'Ukendt',
      public_url: urlData.publicUrl,
      filename: fileName,
      created_at: new Date().toISOString(),
    });

    if (dbError) throw new Error(`Database fejl: ${dbError.message}`);

    // Returner kun succes – intet åbner
    return NextResponse.json({ 
      success: true, 
      message: 'PDF oprettet og gemt',
      pdfUrl: urlData.publicUrl   // sendes med, så FiveM kan logge det hvis ønsket
    });

  } catch (error: any) {
    console.error('PDF error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}