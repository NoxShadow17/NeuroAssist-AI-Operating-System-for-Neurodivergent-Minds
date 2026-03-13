// Reading mode persistence controller
export const getReadingMaterials = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('reading_materials')
      .select('id, title, content, font_size, line_spacing, dyslexia_friendly, created_at, updated_at')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createReadingMaterial = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { data, error } = await req.supabase
      .from('reading_materials')
      .insert({
        user_id: req.user.id,
        title: title || 'Untitled Reading',
        content: content || '',
        font_size: 16,
        line_spacing: 1.5,
        dyslexia_friendly: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReadingMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const { data, error } = await req.supabase
      .from('reading_materials')
      .select('*')
      .eq('id', materialId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Reading material not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateReadingMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { title, content } = req.body;

    // Verify material belongs to user
    const { data: material } = await req.supabase
      .from('reading_materials')
      .select('id')
      .eq('id', materialId)
      .eq('user_id', req.user.id)
      .single();

    if (!material) {
      return res.status(404).json({ error: 'Reading material not found' });
    }

    const { data, error } = await req.supabase
      .from('reading_materials')
      .update({
        title: title !== undefined ? title : undefined,
        content: content !== undefined ? content : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', materialId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveReadingPreferences = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { fontSize, lineSpacing, dyslexiaFriendly } = req.body;

    // Verify material belongs to user
    const { data: material } = await req.supabase
      .from('reading_materials')
      .select('id')
      .eq('id', materialId)
      .eq('user_id', req.user.id)
      .single();

    if (!material) {
      return res.status(404).json({ error: 'Reading material not found' });
    }

    const { data, error } = await req.supabase
      .from('reading_materials')
      .update({
        font_size: fontSize !== undefined ? fontSize : undefined,
        line_spacing: lineSpacing !== undefined ? lineSpacing : undefined,
        dyslexia_friendly: dyslexiaFriendly !== undefined ? dyslexiaFriendly : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', materialId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const trackReadingSession = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { completed, bookmarked } = req.body;

    // Verify material belongs to user
    const { data: material } = await req.supabase
      .from('reading_materials')
      .select('id')
      .eq('id', materialId)
      .eq('user_id', req.user.id)
      .single();

    if (!material) {
      return res.status(404).json({ error: 'Reading material not found' });
    }

    // Record reading session
    const { data, error } = await req.supabase
      .from('reading_sessions')
      .insert({
        user_id: req.user.id,
        material_id: materialId,
        completed: completed || false,
        bookmarked: bookmarked || false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteReadingMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    // Verify material belongs to user
    const { data: material } = await req.supabase
      .from('reading_materials')
      .select('id')
      .eq('id', materialId)
      .eq('user_id', req.user.id)
      .single();

    if (!material) {
      return res.status(404).json({ error: 'Reading material not found' });
    }

    // Delete related reading sessions
    await req.supabase
      .from('reading_sessions')
      .delete()
      .eq('material_id', materialId);

    // Delete material
    const { error } = await req.supabase
      .from('reading_materials')
      .delete()
      .eq('id', materialId);

    if (error) throw error;
    res.json({ message: 'Reading material deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
