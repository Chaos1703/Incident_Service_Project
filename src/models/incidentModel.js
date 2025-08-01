// src/models/incidentModel.js

const { v4: uuidv4 } = require('uuid');
const dynamoService = require('../services/dynamoService');

const TABLE_NAME = process.env.DYNAMO_TABLE;

const createIncident = async (data) => {
  const timestamp = new Date().toISOString();

  const incident = {
    incidentId: uuidv4(),
    title: data.title,
    description: data.description,
    status: data.status || 'open',
    severity: data.severity || 'low',
    reportedBy: data.reportedBy || 'system',

    assignedTo: data.assignedTo || null,
    assignedToId: data.assignedToId || null,

    teamLead: data.teamLead || null,
    teamLeadId: data.teamLeadId || null,

    additionalInfo: data.additionalInfo || '',
    tags: data.tags || [],

    isDeleted: false,
    resolvedAt: data.status === 'resolved' ? timestamp : null,

    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await dynamoService.putItem(TABLE_NAME, incident);
  return incident;
};

const getIncidentById = async (id) => {
  return dynamoService.getItem(TABLE_NAME, { incidentId: id });
};

const listIncidents = async (showDeleted = false) => {
  return dynamoService.scanTable(TABLE_NAME,'isDeleted = :val',{ ':val': showDeleted });
};

const searchByMultipleFields = async (filters) => {
  let filterExpr = 'isDeleted <> :true';
  const exprNames = {};
  const exprValues = { ':true': true };

  for (const [key, value] of Object.entries(filters)) {
    const nameKey = `#${key}`;
    const valueKey = `:${key}`;

    exprNames[nameKey] = key;
    exprValues[valueKey] =
      value === 'true' ? true :
      value === 'false' ? false :
      !isNaN(value) ? Number(value) : value;

    filterExpr += ` AND ${nameKey} = ${valueKey}`;
  }

  return dynamoService.scanTable(TABLE_NAME, filterExpr, exprValues, exprNames);
};

const softDeleteIncidentById = async (id) => {
  return dynamoService.updateItem(TABLE_NAME,{ incidentId: id },'SET isDeleted = :true',{ ':true': true });
};

const restoreIncidentById = async (id) => {
  const incident = await getIncidentById(id);
  if (!incident) throw new Error('Incident not found');
  if (!incident.isDeleted) throw new Error('Incident is not deleted');

  return dynamoService.updateItem(TABLE_NAME,{ incidentId: id },'SET isDeleted = :false, updatedAt = :updatedAt',
    {
      ':false': false,
      ':updatedAt': new Date().toISOString(),
    }
  );
};

const permanentlyDeleteIncidentById = async (id) => {
  await dynamoService.deleteItem(TABLE_NAME, { incidentId: id });
};

const partialUpdateIncidentById = async (id, fieldsToUpdate) => {
  const oldUpdatedAt = fieldsToUpdate.__oldUpdatedAt;
  delete fieldsToUpdate.__oldUpdatedAt;

  const newUpdatedAt = new Date().toISOString();
  fieldsToUpdate.updatedAt = newUpdatedAt;

  const updateExpr = 'SET ' + Object.keys(fieldsToUpdate)
    .map((k) => `#${k} = :${k}`)
    .join(', ');

  const exprNames = {};
  const exprValues = {};

  for (const k in fieldsToUpdate) {
    exprNames[`#${k}`] = k;
    exprValues[`:${k}`] = fieldsToUpdate[k];
  }

  exprNames['#updatedAt'] = 'updatedAt';
  exprValues[':oldUpdatedAt'] = oldUpdatedAt;
  const conditionExpr = '#updatedAt = :oldUpdatedAt';

  return dynamoService.updateItem(TABLE_NAME,{ incidentId: id },updateExpr,exprValues,exprNames,conditionExpr);
};

module.exports = {
  createIncident,
  getIncidentById,
  listIncidents,
  searchByMultipleFields,
  softDeleteIncidentById,
  restoreIncidentById,
  permanentlyDeleteIncidentById,
  partialUpdateIncidentById,
};
