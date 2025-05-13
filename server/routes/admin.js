const express = require('express');
const router = express.Router();
const ProjectService = require('../services/projectService');

router.get('/projects', async (req, res) => {
  try {
    const projects = await ProjectService.getProjectsWithParticipants();
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const result = await ProjectService.createProject(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.sqlMessage || error.message 
    });
  }
});

module.exports = router; 