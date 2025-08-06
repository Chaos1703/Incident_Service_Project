// src/routes/incidentRoutes.js

const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

// ✅ Test route
router.get('/', incidentController.test);

// ✅ Create new incident
router.post('/', incidentController.handleCreateIncident);

// ✅ List all non-deleted incidents
router.get('/all', incidentController.handleListIncidents);

// 🔍 Generic filter route (e.g. /search?status=open&assignedToId=krishna)
router.get('/search', incidentController.handleGetIncidentsByParameters);

// 🧠 Get 5 most recent incidents
router.get('/recent', incidentController.handleListIncidents);

// 🗑️ List soft-deleted incidents
router.get('/deleted', incidentController.handleListDeletedIncidents);

// 🔍 Get one incident by ID
router.get('/:id', incidentController.handleGetIncidentById);

// 🗑️ Soft delete an incident
router.delete('/:id', incidentController.handleSoftDeleteIncident);

// 🔧 General partial update (for any fields except status-specific logic)
router.patch('/:id/updatedAt', incidentController.handlePartialUpdateIncident);

// Restoring Soft Deleted Incident
router.patch('/restore/:id', incidentController.handleRestoreIncident);

// 🗑️ Hard delete an incident (permanently remove)
router.delete('/hard/:id', incidentController.handlePermanentDeleteIncident);

// export the router to be used in app.js
module.exports = router;