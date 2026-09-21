import React, { useState } from 'react';
import { motion } from 'framer-motion';

/* STEP 2 — the intention itself, plus any optional questions this category asks. */
const NumberField = ({ question, value, onChange }) => {
  const [text, setText] = useState(String(value ?? ''));
  const min = question.min ?? 0;
  const max = question.max ?? Number.MAX_SAFE_INTEGER;

  const handleChange = (raw) => {
    setText(raw);
    const parsed = Number(raw);
    if (raw.trim() === '' || Number.isNaN(parsed)) return;
    onChange(Math.min(Math.max(parsed, min), max));
  };

  return (
    <div className="wf-number-field">
      {question.prefix && <span className="wf-number-prefix">{question.prefix}</span>}
      <input
        type="text"
        inputMode="numeric"
        value={text}
        aria-label={question.label}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={() => setText(String(value ?? ''))}
      />
    </div>
  );
};

const IntentInput = ({ session, ...motionProps }) => {
  const { workflow, intent, setIntent, answers, updateAnswer } = session;

  return (
    <motion.div className="wf-stage" {...motionProps}>
      <p className="wf-eyebrow">Your intent</p>
      <h2 className="wf-h2">{workflow.prompt}</h2>
      <p className="wf-body wf-body-tight">
        Write it the way you would say it out loud. FlowState will read it, structure it, and show you the
        plan before anything starts.
      </p>

      <label className="wf-textarea-wrap">
        <span className="wf-visually-hidden">{workflow.prompt}</span>
        <textarea
          className="wf-textarea"
          rows={3}
          value={intent}
          placeholder={workflow.placeholder}
          onChange={(event) => setIntent(event.target.value)}
          data-autofocus
        />
      </label>

      <div className="wf-chips" role="group" aria-label="Suggested intents">
        {workflow.suggestedIntents.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className={`wf-chip${intent.trim() === suggestion ? ' is-active' : ''}`}
            aria-pressed={intent.trim() === suggestion}
            onClick={() => setIntent(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {workflow.questions?.length > 0 && (
        <div className="wf-questions">
          {workflow.questions.map((question) => (
            <div key={question.id} className="wf-question">
              <p className="wf-question-label">{question.label}</p>
              {question.type === 'number' ? (
                <NumberField
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => updateAnswer(question.id, value)}
                />
              ) : (
                <div className="wf-chips" role="group" aria-label={question.label}>
                  {question.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`wf-chip${answers[question.id] === option ? ' is-active' : ''}`}
                      aria-pressed={answers[question.id] === option}
                      onClick={() => updateAnswer(question.id, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="wf-meta wf-meta-quiet">Optional answers shape the plan. You can change them and regenerate.</p>
    </motion.div>
  );
};

export default IntentInput;
