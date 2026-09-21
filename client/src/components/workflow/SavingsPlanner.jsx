import React from 'react';

const formatMoney = (value) => `₹${Math.max(0, Math.round(Number(value) || 0)).toLocaleString('en-IN')}`;

/* Category-specific projection for Financial Freedom. Illustrative arithmetic
   only — it never recommends a product, and it recalculates as the user drags
   the monthly amount. */
const SavingsPlanner = ({ answers, updateAnswer }) => {
  const current = Number(answers.current) || 0;
  const target = Number(answers.target) || 0;
  const monthly = Number(answers.monthly) || 0;

  const gap = Math.max(target - current, 0);
  const months = monthly > 0 ? Math.ceil(gap / monthly) : 0;
  const savedPercent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const milestones = [25, 50, 75, 100]
    .map((percent) => {
      const amountAtMilestone = (target * percent) / 100;
      const remaining = amountAtMilestone - current;
      if (remaining <= 0) return { percent, months: 0 };
      if (monthly <= 0) return { percent, months: null };
      return { percent, months: Math.ceil(remaining / monthly) };
    })
    .filter((milestone) => milestone.months === null || milestone.months >= 0);

  const maxMonthly = Math.max(target || 100000, 10000);

  return (
    <section className="wf-plan" aria-label="Savings projection">
      <div className="wf-plan-head">
        <p className="wf-eyebrow">Projection</p>
        <p className="wf-plan-figures">
          {formatMoney(current)} <span className="wf-plan-arrow" aria-hidden="true">→</span>{' '}
          {formatMoney(target)}
        </p>
        <p className="wf-meta">
          {months > 0
            ? `≈ ${months} month${months === 1 ? '' : 's'} at ${formatMoney(monthly)} per month`
            : 'Set a monthly amount to see a timeline'}
        </p>
      </div>

      <div className="wf-plan-row">
        <label className="wf-plan-slider">
          <span className="wf-visually-hidden">Monthly amount</span>
          <input
            type="range"
            min={500}
            max={maxMonthly}
            step={500}
            value={Math.min(monthly, maxMonthly)}
            onChange={(event) => updateAnswer('monthly', Number(event.target.value))}
          />
        </label>
        <span className="wf-plan-amount">{formatMoney(monthly)} / month</span>
      </div>

      <div className="wf-plan-bar" aria-hidden="true">
        <span className="wf-plan-bar-fill" style={{ width: `${savedPercent}%` }} />
      </div>

      <ul className="wf-plan-milestones">
        {milestones.map((milestone) => (
          <li key={milestone.percent} className="wf-plan-milestone">
            <span className="wf-plan-milestone-label">{milestone.percent}%</span>
            <span className="wf-meta">
              {milestone.months === null
                ? 'needs a monthly amount'
                : milestone.months === 0
                  ? 'already reached'
                  : `month ${milestone.months}`}
            </span>
          </li>
        ))}
      </ul>

      <p className="wf-meta wf-meta-quiet">
        Illustrative estimates from the amounts above — not financial advice, and no products are
        recommended.
      </p>
    </section>
  );
};

export default SavingsPlanner;
