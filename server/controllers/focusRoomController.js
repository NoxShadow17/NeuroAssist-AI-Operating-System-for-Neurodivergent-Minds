import { v4 as uuidv4 } from 'uuid';

export const getRooms = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('focus_rooms')
      .select('*, host:users(name, avatar), participants:room_participants(count)')
      .eq('is_active', true)
      .eq('is_public', true);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { room_name, description, max_participants, timer_duration, is_public, video_enabled, audio_enabled } = req.body;
    const room_code = uuidv4().substring(0, 8).toUpperCase();

    const { data, error } = await req.supabase
      .from('focus_rooms')
      .insert({
        room_name,
        room_code,
        description,
        host_id: req.user.id,
        max_participants: max_participants || 10,
        timer_duration: timer_duration || 25,
        is_public: is_public !== undefined ? is_public : true,
        video_enabled: video_enabled !== undefined ? video_enabled : true,
        audio_enabled: audio_enabled !== undefined ? audio_enabled : false,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const joinRoomByCode = async (req, res) => {
  try {
    const { room_code } = req.body;
    
    const { data: room, error: roomError } = await req.supabase
      .from('focus_rooms')
      .select('id')
      .eq('room_code', room_code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (roomError || !room) return res.status(404).json({ error: 'Room not found' });

    const { error: joinError } = await req.supabase
      .from('room_participants')
      .upsert({ room_id: room.id, user_id: req.user.id });

    if (joinError) throw joinError;

    // Fetch full room details for the frontend
    const { data: roomDetails } = await req.supabase
      .from('focus_rooms')
      .select('*, host:users(name, avatar), participants:room_participants(count)')
      .eq('id', room.id)
      .single();

    res.json({ message: 'Joined room', room: roomDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await req.supabase
      .from('room_participants')
      .upsert({ room_id: id, user_id: req.user.id });

    if (error) throw error;
    res.json({ message: 'Joined room' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await req.supabase
      .from('room_participants')
      .delete()
      .eq('room_id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Left room' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Safety check: Is the user the host?
    const { data: room, error: fetchError } = await req.supabase
      .from('focus_rooms')
      .select('host_id')
      .eq('id', id)
      .single();

    if (fetchError || !room) return res.status(404).json({ error: 'Room not found' });
    if (room.host_id !== req.user.id) return res.status(403).json({ error: 'Only the host can delete this room' });

    const { error: deleteError } = await req.supabase
      .from('focus_rooms')
      .update({ is_active: false })
      .eq('id', id);

    if (deleteError) throw deleteError;
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
