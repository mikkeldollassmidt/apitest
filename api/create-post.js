export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { title } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(`${supabaseUrl}/rest/v1/test_posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([
        {
          title: String(title).trim()
        }
      ])
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data
      });
    }

    return res.status(200).json({
      success: true,
      inserted: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'API route virker'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { title } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'POST virker',
      title: String(title).trim()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}