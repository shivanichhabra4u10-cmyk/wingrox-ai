import { memo } from 'react';
import styles from '../PlatformView.module.css'; // twinSession only

type TwinPhase6CardProps = {
  completionPriority: string;
  completionHorizon: string;
  completionNotes: string;
  completingAssessment: boolean;
  completedAssessmentId: string | null;
  onCompletionPriorityChange: (value: string) => void;
  onCompletionHorizonChange: (value: string) => void;
  onCompletionNotesChange: (value: string) => void;
  onCompleteAssessment: () => void;
  onGoDashboard: () => void;
  onOpenReports: () => void;
  onStartNew: () => void;
};

export const TwinPhase6Card = memo(function TwinPhase6Card({
  completionPriority,
  completionHorizon,
  completionNotes,
  completingAssessment,
  completedAssessmentId,
  onCompletionPriorityChange,
  onCompletionHorizonChange,
  onCompletionNotesChange,
  onCompleteAssessment,
  onGoDashboard,
  onOpenReports,
  onStartNew,
}: TwinPhase6CardProps) {
  return (
    <section className="dash-card" style={{ marginTop: 20 }}>
      <div className="dc-label">Phase 6 · Complete Assessment</div>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, marginBottom: 20 }}>Finalize and lock your assessment submission</h2>

      <div className="field-row">
        <div className="field">
          <label>Top strategic priority for the next cycle</label>
          <select value={completionPriority} onChange={(e) => onCompletionPriorityChange(e.target.value)}>
            <option>Revenue acceleration</option>
            <option>Margin improvement</option>
            <option>Retention and expansion</option>
            <option>Market expansion</option>
            <option>Operational efficiency</option>
          </select>
        </div>
        <div className="field">
          <label>Primary planning horizon</label>
          <select value={completionHorizon} onChange={(e) => onCompletionHorizonChange(e.target.value)}>
            <option>6 months</option>
            <option>12 months</option>
            <option>18 months</option>
            <option>24 months</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Optional final note for report context</label>
        <textarea
          value={completionNotes}
          onChange={(e) => onCompletionNotesChange(e.target.value)}
          rows={4}
          placeholder="Add context you want reflected in the final report..."
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-08)' }}>
        <button
          className="btn-primary"
          type="button"
          onClick={onCompleteAssessment}
          disabled={completingAssessment || Boolean(completedAssessmentId)}
        >
          {completingAssessment
            ? 'Completing...'
            : completedAssessmentId
              ? 'Assessment Completed'
              : 'Complete Assessment & Save'} <span className="arr">→</span>
        </button>
        {completedAssessmentId ? (
          <button className="btn-outline" type="button" onClick={onGoDashboard}>
            Go to Dashboard
          </button>
        ) : null}
      </div>

      {completedAssessmentId ? (
        <>
          <div className={styles.twinSession}>Completed assessment id: {completedAssessmentId}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn-outline" type="button" onClick={onOpenReports}>
              Open Reports
            </button>
            <button className="btn-outline" type="button" onClick={onStartNew}>
              Start New Assessment
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
});
