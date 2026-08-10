import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 06 beat 4 — holding the claim. A node with four GPU slots plays
 * through five acts: reserve (claimed but not running), a second Pod refused
 * the same slot, bind failure → unreserve returns it, a replay where
 * unreserve fires twice (idempotent, count stays right), and finally the
 * leak where unreserve never fires and the visible free count no longer
 * matches reality.
 */

const SLOTS = [
  { id: 0, label: 'gpu-0' },
  { id: 1, label: 'gpu-1' },
  { id: 2, label: 'gpu-2' },
  { id: 3, label: 'gpu-3' },
];

type Slot0State = 'free' | 'heldA' | 'free2' | 'heldB' | 'free3' | 'heldForever';

function slot0State(t: number): Slot0State {
  if (t < 0.15) return 'free';
  if (t < 0.47) return 'heldA';
  if (t < 0.63) return 'free2';
  if (t < 0.71) return 'heldB';
  if (t < 0.83) return 'free3';
  return 'heldForever';
}

const ACTS: { a: number; b: number; text: string; color: string }[] = [
  { a: 0.06, b: 0.28, text: 'act 1 · reserve — Pod A claims gpu-0 before anything runs there', color: PALETTE.amber },
  { a: 0.28, b: 0.44, text: 'act 2 · Pod B arrives and is refused that slot — the claim holds', color: PALETTE.bad },
  { a: 0.44, b: 0.6, text: "act 3 · A's binding fails — unreserve returns the slot", color: PALETTE.good },
  { a: 0.6, b: 0.8, text: 'act 4 · replay — unreserve fires twice, the free count stays right', color: PALETTE.good },
  { a: 0.8, b: 1, text: 'act 5 · the leak — unreserve never fires, the slot is held forever', color: PALETTE.bad },
];

export const ReserveUnreserve: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const nodeIn = appear(t, 0.06, 0.12);
  const state = slot0State(t);
  const act = ACTS.find((a) => t >= a.a && t < a.b) ?? ACTS[0];
  const actOn = appear(t, act.a + 0.04, act.a + 0.1);
  const actOff = 1 - seg(t, act.b, act.b + 0.02);

  const aIn = appear(t, 0.08, 0.14);
  const aReserveTag = appear(t, 0.18, 0.24);
  const bIn = appear(t, 0.3, 0.34);
  const bOut = 1 - seg(t, 0.42, 0.47);
  const aFail = seg(t, 0.46, 0.5);
  const aOut = 1 - seg(t, 0.52, 0.58);
  const replayA = appear(t, 0.62, 0.66);
  const unr1 = appear(t, 0.68, 0.72);
  const unr2 = appear(t, 0.76, 0.8);
  const leakIn = appear(t, 0.84, 0.9);
  const footer4 = appear(t, 0.86, 0.94);
  const footer5 = appear(t, 0.9, 0.96);

  // Pod A chip: present through the reserve arcs, gone after its bind fails.
  const showA = t < 0.47 || (t >= 0.6 && t < 0.83);
  const aGhost = t >= 0.6 && t < 0.83;

  return (
    <div style={{ position: 'absolute', inset: 0, paddingTop: 18 }}>
      <div style={{ textAlign: 'center', opacity: header, marginBottom: 18 }}>
        <Label color={PALETTE.cyan} size={13}>between choosing a node and committing to it, a plugin may hold a resource</Label>
      </div>

      {/* act strip */}
      <div style={{ textAlign: 'center', opacity: actOn * actOff, marginBottom: 18 }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 17,
            fontWeight: 900,
            color: act.color,
            border: `1px solid ${act.color}66`,
            background: `${act.color}10`,
            borderRadius: 999,
            padding: '8px 22px',
            whiteSpace: 'nowrap',
          }}
        >
          {act.text}
        </span>
      </div>

      {/* pods */}
      <div style={{ position: 'relative', height: 86, marginBottom: 10 }}>
        {/* Pod A */}
        {showA && (
          <div
            style={{
              position: 'absolute',
              left: 430,
              top: 8,
              opacity: aIn * (1 - aOut) * (aGhost ? 0.55 : 1),
              transform: `translateX(${(t >= 0.08 && t < 0.47 ? seg(t, 0.1, 0.2) : 0) * 46}px)`,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                color: aFail > 0 ? PALETTE.bad : PALETTE.cyan,
                border: `2px solid ${aFail > 0 ? PALETTE.bad : PALETTE.cyan}`,
                background: `${aFail > 0 ? PALETTE.bad : PALETTE.cyan}12`,
                borderRadius: 10,
                padding: '8px 16px',
                fontSize: 17,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              {aFail > 0 ? 'pod A ✕ bind fails' : aGhost ? 'pod A (replay)' : 'pod A'}
            </div>
            {aReserveTag > 0 && aFail === 0 && (
              <div style={{ textAlign: 'center', opacity: aReserveTag, marginTop: 5 }}>
                <Label color={PALETTE.amber} size={11} style={{ textTransform: 'none', letterSpacing: 0 }}>→ reserve</Label>
              </div>
            )}
          </div>
        )}

        {/* Pod B */}
        <div
          style={{
            position: 'absolute',
            left: 690,
            top: 8,
            opacity: bIn * bOut,
            transform: `translateX(${seg(t, 0.3, 0.38) * 40}px)`,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.violet,
              border: `2px solid ${PALETTE.violet}`,
              background: `${PALETTE.violet}12`,
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 17,
              fontWeight: 900,
              whiteSpace: 'nowrap',
            }}
          >
            pod B
          </div>
          {t > 0.38 && (
            <div style={{ textAlign: 'center', marginTop: 5, opacity: appear(t, 0.38, 0.42) }}>
              <Label color={PALETTE.bad} size={12} style={{ textTransform: 'none', letterSpacing: 0 }}>✕ refused — the slot is claimed</Label>
            </div>
          )}
        </div>

        {/* replay unresolve markers */}
        {unr1 > 0 && (
          <div style={{ position: 'absolute', left: 940, top: 8, opacity: unr1 }}>
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, fontWeight: 900, background: `${PALETTE.good}10`, border: `1px solid ${PALETTE.good}55`, borderRadius: 8, padding: '6px 12px', whiteSpace: 'nowrap' }}>
              ↺ unreserve #1 — slot released
            </span>
          </div>
        )}
        {unr2 > 0 && (
          <div style={{ position: 'absolute', left: 1150, top: 8, opacity: unr2 }}>
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, fontWeight: 900, background: `${PALETTE.good}10`, border: `1px solid ${PALETTE.good}55`, borderRadius: 8, padding: '6px 12px', whiteSpace: 'nowrap' }}>
              ↺ unreserve #2 — fired again, still 3 free (idempotent)
            </span>
          </div>
        )}
      </div>

      {/* the node */}
      <div style={{ opacity: nodeIn, display: 'flex', justifyContent: 'center', gap: 26 }}>
        {SLOTS.map((s) => {
          const isDrama = s.id === 0;
          const slotState = isDrama ? state : s.id === 1 ? 'running' : 'free';
          return (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 158,
                  height: 132,
                  borderRadius: 16,
                  border: `2px solid ${borderFor(slotState)}`,
                  background: bgFor(slotState),
                  boxShadow: slotState === 'heldForever' ? `0 0 24px ${PALETTE.bad}44` : slotState === 'heldA' || slotState === 'heldB' ? `0 0 18px ${PALETTE.amber}33` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  position: 'relative',
                }}
              >
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700 }}>{s.label}</div>
                {slotState === 'free' && (
                  <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, fontWeight: 900 }}>{isDrama ? 'free' : 'free'}</div>
                )}
                {slotState === 'running' && (
                  <>
                    <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 15, fontWeight: 900 }}>▣ pod</div>
                    <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 12, fontWeight: 700 }}>running</div>
                  </>
                )}
                {(slotState === 'heldA' || slotState === 'heldB' || slotState === 'heldForever') && (
                  <>
                    <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 15, fontWeight: 900 }}>
                      {slotState === 'heldForever' ? 'held' : 'held'}
                    </div>
                    <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 12, fontWeight: 700 }}>
                      {slotState === 'heldForever' ? 'forever' : 'claimed'}
                    </div>
                    <span
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 8,
                        fontFamily: MONO,
                        fontSize: 11,
                        fontWeight: 900,
                        color: PALETTE.amber,
                        background: '#0c111c',
                        borderRadius: 6,
                        padding: '2px 6px',
                        border: `1px solid ${PALETTE.amber}55`,
                      }}
                    >
                      RESERVE
                    </span>
                  </>
                )}
                {slotState === 'heldForever' && (
                  <div style={{ position: 'absolute', bottom: -26, whiteSpace: 'nowrap' }}>
                    <Label color={PALETTE.bad} size={11} style={{ textTransform: 'none', letterSpacing: 0 }}>↺ unreserve never fires</Label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* free-count readout */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, marginTop: 44 }}>
        {state !== 'heldForever' ? (
          <>
            <Count label={`free ${state === 'free' || state === 'free2' || state === 'free3' ? 3 : 2}/4`} color={PALETTE.good} />
            {(state === 'heldA' || state === 'heldB') && <Count label="held 1/4" color={PALETTE.amber} />}
            <Count label="running 1/4" color={PALETTE.cyan} />
          </>
        ) : (
          <>
            <Count label="visible free count: 3/4" color={PALETTE.good} />
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 26, fontWeight: 900, opacity: leakIn }}>≠</span>
            <Count label="actually usable: 2/4" color={PALETTE.bad} />
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 800, opacity: leakIn, maxWidth: 300 }}>
              the node counts a slot nobody can get
            </span>
          </>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 30, minHeight: 26 }}>
        {t >= 0.6 && t < 0.8 && footer4 > 0 && (
          <Label color={PALETTE.amber} size={13}>unreserve can fire more than once for the same Pod — it has to be idempotent</Label>
        )}
        {t >= 0.8 && footer5 > 0 && (
          <Label color={PALETTE.bad} size={13}>a leaked reservation is capacity that nobody can use and nobody can see</Label>
        )}
      </div>
    </div>
  );
};

function Count({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontFamily: MONO, color, fontSize: 19, fontWeight: 900, border: `1px solid ${color}55`, background: `${color}0d`, borderRadius: 10, padding: '7px 16px', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

function borderFor(state: string): string {
  if (state === 'running') return PALETTE.cyan;
  if (state === 'free' || state === 'free2' || state === 'free3') return PALETTE.good;
  return PALETTE.amber;
}

function bgFor(state: string): string {
  if (state === 'running') return `${PALETTE.cyan}0d`;
  if (state === 'free' || state === 'free2' || state === 'free3') return `${PALETTE.good}08`;
  // held — striped, distinct from both free and running
  return `repeating-linear-gradient(45deg, ${PALETTE.amber}26 0 10px, transparent 10px 20px)`;
}
