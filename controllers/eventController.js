// controllers/eventController.js
const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const event = await Event.create({ name });
    res.status(201).json({ message: 'Event created', event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
};

exports.startEvent = async (req, res) => {
    try {
      const { eventId, start_time, duration_minutes } = req.body;
  
      if (!eventId || !start_time || !duration_minutes) {
        return res.status(400).json({ error: 'eventId, start_time, and duration_minutes are required' });
      }
  
      const event = await Event.findByPk(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });
  
      const start = new Date(start_time);
      const end = new Date(start.getTime() + duration_minutes * 60000);
  
      event.start_time = start;
      event.end_time = end;
      event.is_active = true;
      await event.save();
  
      res.status(200).json({ message: 'Event started successfully', event });
    } catch (error) {
      res.status(500).json({ error: 'Error starting event', details: error.message });
    }
  };

  exports.getAllEvents = async (req, res) => {
    try {
      const events = await Event.findAll();
      res.status(200).json({ events });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching events', details: error.message });
    }
  };
