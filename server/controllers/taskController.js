import aiService from '../services/aiService.js';
import gamificationService from '../services/gamificationService.js';

export const getTasks = async (req, res) => {
  try {
    const { data: tasks, error } = await req.supabase
      .from('tasks')
      .select('*, task_steps(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, category, due_date } = req.body;
    const { data, error } = await req.supabase
      .from('tasks')
      .insert({
        user_id: req.user.id,
        title,
        description,
        priority,
        category,
        due_date,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    const { data, error } = await req.supabase
      .from('tasks')
      .update({ ...req.body, updated_at: new Date() })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Award XP if completed
    if (completed) {
      const xpResult = await gamificationService.awardXP(req.user.id, 'task_complete');
      return res.json({ task: data, xpResult });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await req.supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const decomposeTaskAction = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get task and user profile/settings
    const { data: task } = await req.supabase.from('tasks').select('*').eq('id', id).single();
    const { data: user } = await req.supabase.from('users').select('neuro_profile').eq('id', req.user.id).single();
    const { data: settings } = await req.supabase.from('user_settings').select('task_granularity').eq('user_id', req.user.id).single();

    const steps = await aiService.decomposeTask(
      task.title, 
      user.neuro_profile, 
      settings?.task_granularity || 'micro',
      task.category, 
      task.description
    );

    // Save steps to database
    const stepsToInsert = steps.map((s, index) => ({
      task_id: id,
      user_id: req.user.id,
      step_text: s.step,
      step_order: index,
      estimated_minutes: s.minutes,
    }));

    const { data: savedSteps, error } = await req.supabase
      .from('task_steps')
      .insert(stepsToInsert)
      .select();

    if (error) throw error;
    res.json(savedSteps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleStep = async (req, res) => {
  try {
    const { stepId } = req.params;
    const { completed } = req.body;

    const { data, error } = await req.supabase
      .from('task_steps')
      .update({ completed })
      .eq('id', stepId)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    let xpResult = null;
    if (completed) {
      xpResult = await gamificationService.awardXP(req.user.id, 'task_step_complete');
    }

    res.json({ step: data, xpResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
