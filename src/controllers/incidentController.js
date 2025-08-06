// src/controllers/incidentController.js

const {
  createIncident,
  searchByMultipleFields,
  listIncidents,
  softDeleteIncidentById,
  restoreIncidentById,
  getIncidentById,
  permanentlyDeleteIncidentById,
  partialUpdateIncidentById,
} = require('../models/incidentModel');

const test = (req, res) => {
  res.send('Incident route is working fine!!!!');
};

// Create new incident
const handleCreateIncident = async (req, res) => {
  try {
    const newIncident = await createIncident(req.body);
    res.status(201).json(newIncident);
  } catch (err) {
    console.error('Error creating incident:', err);
    res.status(500).json({ error: 'Failed to create incident' });
  }
};

const handleGetIncidentById = async (req, res) => {
  const id = req.params.id;

  try {
    const incident = await getIncidentById(id);

    if (!incident || incident.isDeleted) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (err) {
    console.error('Error fetching incident:', err);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
};

const handleGetIncidentsByParameters = async (req, res) => {
  try {
    const filters = req.query;

    if (Object.keys(filters).length === 0) {
      return res.status(400).json({ error: 'No search parameters provided' });
    }

    const results = await searchByMultipleFields(filters);
    res.json(results);
  } catch (err) {
    console.error('Error during search:', err);
    res.status(500).json({ error: 'Failed to search incidents' });
  }
};

const handleListIncidents = async (req, res) => {
  try {
    const { recent } = req.query;

    const incidents = await listIncidents(); 

    if (recent === 'true') {
      const sorted = incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(sorted.slice(0, 5));
    }

    return res.json(incidents); 
  } catch (err) {
    console.error('Error listing incidents:', err);
    res.status(500).json({ error: 'Failed to list incidents' });
  }
};


// 🧾 GET /api/incidents/deleted
const handleListDeletedIncidents = async (req, res) => {
  try {
    const incidents = await listIncidents(true);
    res.json(incidents);
  } catch (err) {
    console.error('Error fetching deleted incidents:', err);
    res.status(500).json({ error: 'Failed to fetch deleted incidents' });
  }
};

// 🗑️ DELETE /api/incidents/:id
const handleSoftDeleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await softDeleteIncidentById(id);
    res.json(result);
  } catch (err) {
    console.error('Error soft deleting incident:', err);
    res.status(500).json({ error: 'Failed to delete incident' });
  }
};

const handlePartialUpdateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const fieldsToUpdate = req.body;

    if (!fieldsToUpdate.__oldUpdatedAt) {
      return res.status(400).json({ error: '__oldUpdatedAt is required for optimistic locking' });
    }

    const updatedIncident = await partialUpdateIncidentById(id, fieldsToUpdate);
    res.json(updatedIncident);
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      return res.status(409).json({ error: 'Conflict: Data was modified by another user' });
    }

    console.error('Error partially updating incident:', err);
    res.status(500).json({ error: 'Failed to update incident' });
  }
};


const handleRestoreIncident = async (req, res) => {
  const { id } = req.params;

  try {
    const restoredIncident = await restoreIncidentById(id);
    res.json({
      message: 'Incident restored successfully',
      incident: restoredIncident,
    });
  } catch (err) {
    console.error('Error restoring incident:', err);
    res.status(500).json({ error: 'Failed to restore incident' });
  }
};

const handlePermanentDeleteIncident = async (req, res) => {
  const { id } = req.params;

  try {
    await permanentlyDeleteIncidentById(id);
    res.json({ message: 'Incident permanently deleted' });
  } catch (err) {
    console.error('Error permanently deleting incident:', err);
    res.status(500).json({ error: 'Failed to permanently delete incident' });
  }
};

module.exports = {
  test,
  handleCreateIncident,
  handleGetIncidentsByParameters,
  handleListIncidents,
  handleListDeletedIncidents,
  handleSoftDeleteIncident,
  handlePartialUpdateIncident,
  handleGetIncidentById,
  handleRestoreIncident,
  handlePermanentDeleteIncident,
};
