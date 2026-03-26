import Podcast from '../models/podcast.model.js';

export const getPublishedPodcasts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const podcasts = await Podcast.find({ published: true })
      .populate('author', 'name email')
      .skip(startIndex)
      .limit(limit);
      
    res.status(200).json(podcasts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener podcasts' });
  }
};

export const getPodcastById = async (req, res) => {
  try {
    const podcast = await Podcast.findOne({ _id: req.params.id, published: true }).populate('author', 'name email');
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast no encontrado o no publicado' });
    }
    res.status(200).json(podcast);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener podcast' });
  }
};

export const createPodcast = async (req, res) => {
  try {
    const { title, description, category, duration, episodes, published } = req.body;

    const podcast = await Podcast.create({
      title,
      description,
      author: req.user._id,
      category,
      duration,
      episodes,
      published,
    });

    res.status(201).json(podcast);
  } catch (error) {
    if (error.name === 'ValidationError') {
       return res.status(400).json({ error: Object.values(error.errors).map(val => val.message).join(', ') });
    }
    res.status(500).json({ error: 'Error al crear el podcast' });
  }
};

export const updatePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast no encontrado' });
    }

    if (podcast.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para actualizar este podcast' });
    }

    const updatedPodcast = await Podcast.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedPodcast);
  } catch (error) {
    if (error.name === 'ValidationError') {
       return res.status(400).json({ error: Object.values(error.errors).map(val => val.message).join(', ') });
    }
    res.status(500).json({ error: 'Error al actualizar el podcast' });
  }
};

export const deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast no encontrado' });
    }

    await Podcast.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Podcast eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el podcast' });
  }
};

export const getAllPodcastsAdmin = async (req, res) => {
  try {
    const podcasts = await Podcast.find().populate('author', 'name email');
    res.status(200).json(podcasts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los podcasts' });
  }
};

export const togglePublishPodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast no encontrado' });
    }

    podcast.published = !podcast.published;
    await podcast.save();
    
    res.status(200).json(podcast);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado de publicación' });
  }
};
