'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPdfs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pdf_list')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setPdfs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  const filteredPdfs = pdfs.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Revisor PDF Arkiv</h1>
      <p className="text-gray-600 mb-8">Alle bogføringer fra FiveM-serveren</p>

      <input
        type="text"
        placeholder="Søg efter navn eller titel..."
        className="w-full p-4 border border-gray-300 rounded-xl text-lg mb-8 focus:outline-none focus:border-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Henter PDF’er...</p>
      ) : (
        <div className="space-y-4">
          {filteredPdfs.length === 0 ? (
            <p>Ingen PDF’er fundet.</p>
          ) : (
            filteredPdfs.map((pdf) => (
              <div key={pdf.id} className="flex justify-between items-center bg-white border border-gray-200 p-5 rounded-xl hover:shadow-md">
                <div>
                  <div className="font-semibold text-lg">{pdf.title}</div>
                  <div className="text-gray-600">{pdf.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(pdf.created_at).toLocaleDateString('da-DK')} kl. {new Date(pdf.created_at).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <a
                  href={pdf.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
                >
                  Åbn PDF
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}