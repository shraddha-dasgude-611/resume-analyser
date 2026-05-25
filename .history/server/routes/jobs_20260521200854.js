const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/search', async (req, res) => {
  const { position, location = 'India' } = req.query;

  if (!position) return res.status(400).json({ error: 'Position is required' });

  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: `${position} in ${location}`,
        page: '1',
        num_pages: '1',
        country: 'in'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    const jobs = response.data.data.map(job => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city || job.job_country,
      platform: job.job_publisher,
      applyLink: job.job_apply_link,
      postedAt: job.job_posted_at_datetime_utc,
      description: job.job_description?.substring(0, 200) + '...',
      logo: job.employer_logo
    }));

    res.json(jobs);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

module.exports = router;
