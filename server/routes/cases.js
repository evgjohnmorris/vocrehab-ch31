import express from 'express';
import db from '../db.js';
import {
  CASE_STORAGE_GUIDANCE,
  createCaseChildId,
  createCaseRecordId,
  getCaseIssueDefinition,
  getCommunitySignalSummary,
  getProblemRouter,
  validateCaseActivityPayload,
  validateCaseDeadlinePayload,
  validateCaseDocumentPayload,
  validateCurrentCaseRecordPayload
} from '../lib/caseManagement.js';
import { getRequestScope } from '../lib/userState.js';

const router = express.Router();

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({
        changes: this.changes,
        lastID: this.lastID
      });
    });
  });
}

function mapIssueRow(row) {
  if (!row) {
    return null;
  }

  try {
    return JSON.parse(row.workflow_json);
  } catch {
    return getCaseIssueDefinition(row.id);
  }
}

function mapDeadlineRow(row) {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    status: row.status,
    source: row.source,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapActivityRow(row) {
  return {
    id: row.id,
    activityType: row.activity_type,
    occurredAt: row.occurred_at,
    summary: row.summary,
    responseStatus: row.response_status,
    notes: row.notes,
    createdAt: row.created_at
  };
}

function mapDocumentRow(row) {
  return {
    id: row.id,
    documentType: row.document_type,
    title: row.title,
    templateId: row.template_id,
    status: row.status,
    generatedBody: row.generated_body,
    notes: row.notes,
    createdAt: row.created_at
  };
}

async function loadIssueCatalog(options = {}) {
  const params = [];
  let sql = `
    SELECT id, workflow_json
    FROM case_issue_taxonomy
  `;

  if (options.dashboardOnly) {
    sql += ' WHERE dashboard_enabled = 1';
  }

  sql += ' ORDER BY title ASC';

  const rows = await dbAll(sql, params);
  return rows
    .map(mapIssueRow)
    .filter(Boolean)
    .sort((left, right) => {
      const priorityDiff = (left.priorityRank ?? 999) - (right.priorityRank ?? 999);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return String(left.title || '').localeCompare(String(right.title || ''));
    });
}

async function loadCurrentCaseRow(scope) {
  return dbGet(`
    SELECT *
    FROM case_records
    WHERE scope = ?
    LIMIT 1
  `, [scope]);
}

async function loadCaseBundleByScope(scope) {
  const row = await loadCurrentCaseRow(scope);
  if (!row) {
    return null;
  }

  const [issueRow, deadlineRows, activityRows, documentRows] = await Promise.all([
    dbGet('SELECT id, workflow_json FROM case_issue_taxonomy WHERE id = ?', [row.issue_type_id]),
    dbAll('SELECT * FROM case_deadlines WHERE case_id = ? ORDER BY due_date ASC, created_at ASC', [row.id]),
    dbAll('SELECT * FROM case_activities WHERE case_id = ? ORDER BY occurred_at DESC, created_at DESC', [row.id]),
    dbAll('SELECT * FROM case_documents WHERE case_id = ? ORDER BY created_at DESC', [row.id])
  ]);

  return {
    id: row.id,
    title: row.title,
    veteranName: row.veteran_name,
    claimantReference: row.claimant_reference,
    counselorName: row.counselor_name,
    regionalOffice: row.regional_office,
    schoolName: row.school_name,
    issueTypeId: row.issue_type_id,
    caseStage: row.case_stage,
    track: row.track,
    trackRequested: row.track_requested,
    trackApproved: row.track_approved,
    employmentHandicapStatus: row.employment_handicap_status,
    seriousEmploymentHandicapStatus: row.serious_employment_handicap_status,
    feasibilityStatus: row.feasibility_status,
    ipeStatus: row.ipe_status,
    iilpStatus: row.iilp_status,
    issueSummary: row.issue_summary,
    disputeHistory: row.dispute_history,
    escalationHistory: row.escalation_history,
    evidenceSummary: row.evidence_summary,
    decisionNoticeDate: row.decision_notice_date,
    followUpDeadlineDate: row.follow_up_deadline_date,
    termStart: row.term_start,
    termEnd: row.term_end,
    urgentDeadline: row.urgent_deadline,
    createdFromWorkflowId: row.created_from_workflow_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    issue: mapIssueRow(issueRow),
    deadlines: deadlineRows.map(mapDeadlineRow),
    activities: activityRows.map(mapActivityRow),
    documents: documentRows.map(mapDocumentRow)
  };
}

async function requireCurrentCase(scope) {
  const currentCase = await loadCaseBundleByScope(scope);
  if (!currentCase) {
    const error = new Error('No structured case record exists for this client scope.');
    error.statusCode = 404;
    throw error;
  }

  return currentCase;
}

router.get('/dashboard', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const [workflows, allIssues, currentCase] = await Promise.all([
      loadIssueCatalog({ dashboardOnly: true }),
      loadIssueCatalog(),
      loadCaseBundleByScope(scope)
    ]);

    res.json({
      currentCase,
      workflows,
      problemRouter: {
        options: getProblemRouter()
      },
      communitySignals: getCommunitySignalSummary(),
      issueTaxonomy: {
        total: allIssues.length,
        dashboardEnabled: workflows.length
      },
      privacyGuidance: CASE_STORAGE_GUIDANCE
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/taxonomy', async (req, res) => {
  try {
    const dashboardOnly = req.query.dashboardOnly === 'true';
    const workflows = await loadIssueCatalog({ dashboardOnly });
    res.json(workflows);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/problem-router', async (req, res) => {
  try {
    res.json({
      communitySignals: getCommunitySignalSummary(),
      options: getProblemRouter()
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/current', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const currentCase = await loadCaseBundleByScope(scope);

    if (!currentCase) {
      res.status(404).json({ error: 'No structured case record exists for this client scope.' });
      return;
    }

    res.json(currentCase);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.put('/current', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const payload = validateCurrentCaseRecordPayload(req.body);
    const existing = await loadCurrentCaseRow(scope);
    const caseId = existing?.id || createCaseRecordId();
    const statusCode = existing ? 200 : 201;

    if (existing) {
      await dbRun(`
        UPDATE case_records
        SET
          title = ?,
          veteran_name = ?,
          claimant_reference = ?,
          counselor_name = ?,
          regional_office = ?,
          school_name = ?,
          issue_type_id = ?,
          case_stage = ?,
          track = ?,
          track_requested = ?,
          track_approved = ?,
          employment_handicap_status = ?,
          serious_employment_handicap_status = ?,
          feasibility_status = ?,
          ipe_status = ?,
          iilp_status = ?,
          issue_summary = ?,
          dispute_history = ?,
          escalation_history = ?,
          evidence_summary = ?,
          decision_notice_date = ?,
          follow_up_deadline_date = ?,
          term_start = ?,
          term_end = ?,
          urgent_deadline = ?,
          created_from_workflow_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND scope = ?
      `, [
        payload.title,
        payload.veteranName,
        payload.claimantReference,
        payload.counselorName,
        payload.regionalOffice,
        payload.schoolName,
        payload.issueTypeId,
        payload.caseStage,
        payload.track,
        payload.trackRequested,
        payload.trackApproved,
        payload.employmentHandicapStatus,
        payload.seriousEmploymentHandicapStatus,
        payload.feasibilityStatus,
        payload.ipeStatus,
        payload.iilpStatus,
        payload.issueSummary,
        payload.disputeHistory,
        payload.escalationHistory,
        payload.evidenceSummary,
        payload.decisionNoticeDate,
        payload.followUpDeadlineDate,
        payload.termStart,
        payload.termEnd,
        payload.urgentDeadline,
        payload.createdFromWorkflowId,
        caseId,
        scope
      ]);
    } else {
      await dbRun(`
        INSERT INTO case_records (
          id,
          scope,
          title,
          veteran_name,
          claimant_reference,
          counselor_name,
          regional_office,
          school_name,
          issue_type_id,
          case_stage,
          track,
          track_requested,
          track_approved,
          employment_handicap_status,
          serious_employment_handicap_status,
          feasibility_status,
          ipe_status,
          iilp_status,
          issue_summary,
          dispute_history,
          escalation_history,
          evidence_summary,
          decision_notice_date,
          follow_up_deadline_date,
          term_start,
          term_end,
          urgent_deadline,
          created_from_workflow_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        caseId,
        scope,
        payload.title,
        payload.veteranName,
        payload.claimantReference,
        payload.counselorName,
        payload.regionalOffice,
        payload.schoolName,
        payload.issueTypeId,
        payload.caseStage,
        payload.track,
        payload.trackRequested,
        payload.trackApproved,
        payload.employmentHandicapStatus,
        payload.seriousEmploymentHandicapStatus,
        payload.feasibilityStatus,
        payload.ipeStatus,
        payload.iilpStatus,
        payload.issueSummary,
        payload.disputeHistory,
        payload.escalationHistory,
        payload.evidenceSummary,
        payload.decisionNoticeDate,
        payload.followUpDeadlineDate,
        payload.termStart,
        payload.termEnd,
        payload.urgentDeadline,
        payload.createdFromWorkflowId
      ]);
    }

    const currentCase = await loadCaseBundleByScope(scope);
    res.status(statusCode).json(currentCase);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/current/deadlines', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const currentCase = await requireCurrentCase(scope);
    res.json(currentCase.deadlines);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/current/deadlines', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const currentCase = await requireCurrentCase(scope);
    const payload = validateCaseDeadlinePayload(req.body);
    const deadlineId = createCaseChildId('deadline');

    await dbRun(`
      INSERT INTO case_deadlines (id, case_id, title, due_date, status, source, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      deadlineId,
      currentCase.id,
      payload.title,
      payload.dueDate,
      payload.status,
      payload.source,
      payload.notes
    ]);

    const row = await dbGet('SELECT * FROM case_deadlines WHERE id = ?', [deadlineId]);
    res.status(201).json(mapDeadlineRow(row));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/current/activities', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const currentCase = await requireCurrentCase(scope);
    res.json(currentCase.activities);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/current/activities', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const currentCase = await requireCurrentCase(scope);
    const payload = validateCaseActivityPayload(req.body);
    const activityId = createCaseChildId('activity');

    await dbRun(`
      INSERT INTO case_activities (id, case_id, activity_type, occurred_at, summary, response_status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      activityId,
      currentCase.id,
      payload.activityType,
      payload.occurredAt,
      payload.summary,
      payload.responseStatus,
      payload.notes
    ]);

    const row = await dbGet('SELECT * FROM case_activities WHERE id = ?', [activityId]);
    res.status(201).json(mapActivityRow(row));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.delete('/current/activities/:activityId', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const currentCase = await requireCurrentCase(scope);
    const { activityId } = req.params;

    const result = await dbRun('DELETE FROM case_activities WHERE id = ? AND case_id = ?', [activityId, currentCase.id]);
    if (!result.changes) {
      res.status(404).json({ error: `Activity not found: ${activityId}` });
      return;
    }

    res.status(204).end();
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/current/documents', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const currentCase = await requireCurrentCase(scope);
    res.json(currentCase.documents);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/current/documents', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const currentCase = await requireCurrentCase(scope);
    const payload = validateCaseDocumentPayload(req.body);
    const documentId = createCaseChildId('document');

    await dbRun(`
      INSERT INTO case_documents (id, case_id, document_type, title, template_id, status, generated_body, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      documentId,
      currentCase.id,
      payload.documentType,
      payload.title,
      payload.templateId,
      payload.status,
      payload.generatedBody,
      payload.notes
    ]);

    const row = await dbGet('SELECT * FROM case_documents WHERE id = ?', [documentId]);
    res.status(201).json(mapDocumentRow(row));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

export default router;
