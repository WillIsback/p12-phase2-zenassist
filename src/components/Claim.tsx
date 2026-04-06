'use client';

import styles from './Claim.module.css';
import type { Claim } from '@/database/queries.ts';
import { WandSparkles, Ellipsis } from 'lucide-react';
import { llmAutoTag } from '@/app/actions/cls.action';
import { useTransition, useState } from 'react';

interface ClaimProps {
  claim: Claim;
  isSelected: boolean;
  onClick: () => void;
  onTagClick?: (tag: string) => void;
  onAutoTagComplete?: (claimId: number, tag: string) => void;
}

export default function ClaimComponent({ claim, isSelected, onClick, onTagClick, onAutoTagComplete }: Readonly<ClaimProps>) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(false);

  const submitAction = async () => {
    console.log('[Claim] submitAction called for claim', claim.id);
    setError(false);
    setIsPending(true);
    try {
      const result = await llmAutoTag(claim.id, claim.content);
      console.log('[Claim] llmAutoTag returned:', result);
      if (result == null) {
        setError(true);
      } else {
        console.log('[Claim] calling onAutoTagComplete, defined?', !!onAutoTagComplete);
        onAutoTagComplete?.(claim.id, result);
      }
    } catch (err) {
      console.error('[Claim] submitAction error:', err);
      setError(true);
    } finally {
      setIsPending(false);
    }
  };

  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (claim.tag && onTagClick) {
      onTagClick(claim.tag);
    }
  };
  ;
  return (
    <div className={styles.claim_card}>
      <div
        className={`${styles.container} ${isSelected ? styles.selected : ''}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
      >
        <div className={styles.content}>
          <p
            className={styles.text}
            id={`claim-content-${claim.id}`}
          >
            {claim.content}
          </p>
          {claim.tag && (
            <button
              className={styles.tag}
              onClick={handleTagClick}
              aria-label={`Navigate to ${claim.tag} inbox`}
              title={`Go to ${claim.tag} inbox`}
              type='button'
            >
              {claim.tag}
            </button>
          )}
          {error && <span className={styles.error}>Classification failed</span>}
        </div>

      </div>
      <button
      className={styles.ia_button}
      type='button'
      onClick={(e) => { e.stopPropagation(); submitAction(); }}
      disabled={isPending}
      >
      {isPending ? <Ellipsis size={16} className={styles.ellipsis} /> : <WandSparkles size={16}/>}
    </button>
  </div>
  );
}