import React from 'react';
import type { VisualProps } from '../module';
import { ColdOpen } from './ColdOpen';
import { LaneIntro } from './LaneIntro';
import { RequestArrives } from './RequestArrives';
import { GateSequence } from './GateSequence';
import { Quorum } from './Quorum';
import { ControllerChain } from './ControllerChain';
import { SchedulerCycle } from './SchedulerCycle';
import { Binding } from './Binding';
import { Handoff } from './Handoff';
import { Sandbox } from './Sandbox';
import { CniExec } from './CniExec';
import { Layers } from './Layers';
import { Probes } from './Probes';
import { Endpoints } from './Endpoints';
import { DataPlane } from './DataPlane';
import { PacketJourney } from './PacketJourney';
import { FailureMap } from './FailureMap';
import { SpineRecap } from './SpineRecap';
import { SpineLocator } from './SpineLocator';
// module 01
import { ComponentMap } from './ComponentMap';
import { ContractBoundary } from './ContractBoundary';
import { StoreContents } from './StoreContents';
import { ControllerFamily } from './ControllerFamily';
import { OutageMatrix } from './OutageMatrix';
import { FrozenCluster } from './FrozenCluster';
// module 02
import { AuthGates } from './AuthGates';
import { WebhookBlast } from './WebhookBlast';
import { FailurePolicy } from './FailurePolicy';
import { WebhookChecklist } from './WebhookChecklist';
import { RejectionLadder } from './RejectionLadder';
import { OptimisticConcurrency } from './OptimisticConcurrency';
import { ManagedFields } from './ManagedFields';
// module 03
import { InformerLoop } from './InformerLoop';
import { Workqueue } from './Workqueue';
import { LevelVsEdge } from './LevelVsEdge';
import { Relist } from './Relist';
import { HotLoop } from './HotLoop';
import { ExternalState } from './ExternalState';
import { ResyncTick } from './ResyncTick';
import { QueueProperties } from './QueueProperties';
import { ControllerSignals } from './ControllerSignals';
// module 04
import { WorkloadMatrix } from './WorkloadMatrix';
import { StatefulLimit } from './StatefulLimit';
import { CoverageVsCompletion } from './CoverageVsCompletion';
import { AutoscalerConflict } from './AutoscalerConflict';
import { AutoscalerFix } from './AutoscalerFix';
import { PdbScope } from './PdbScope';
import { ThreeDeaths } from './ThreeDeaths';
import { RolloutMechanics } from './RolloutMechanics';
import { ReadinessThrottle } from './ReadinessThrottle';
import { JobNumbers } from './JobNumbers';
// module 05
import { FourWords } from './FourWords';
import { CrdAlone } from './CrdAlone';
import { SpecStatus } from './SpecStatus';
import { ApiContract } from './ApiContract';
import { ServedStored } from './ServedStored';
import { MigrationOrder } from './MigrationOrder';
import { Finalizers } from './Finalizers';
import { ForceRemove } from './ForceRemove';
import { SchemaSemantics } from './SchemaSemantics';
import { ValidateEarly } from './ValidateEarly';
import { OperatorTest } from './OperatorTest';
// module 06
import { TwoCycles } from './TwoCycles';
import { ReserveUnreserve } from './ReserveUnreserve';
import { RequestsVsUsage } from './RequestsVsUsage';
import { RequestErrors } from './RequestErrors';
import { PendingLadder } from './PendingLadder';
import { NominatedNode } from './NominatedNode';
import { PreemptionPolicy } from './PreemptionPolicy';
// module 07
import { KubeletLoop } from './KubeletLoop';
import { NodeSequence } from './NodeSequence';
import { FourBoundaries } from './FourBoundaries';
import { CriVsOci } from './CriVsOci';
import { PhaseVsHealth } from './PhaseVsHealth';
import { TrafficChain } from './TrafficChain';
import { TerminationRace } from './TerminationRace';
import { StaleStatus } from './StaleStatus';

export const VISUALS: Record<string, React.ComponentType<VisualProps>> = {
  // pilot
  coldOpen: ColdOpen,
  laneIntro: LaneIntro,
  requestArrives: RequestArrives,
  gateSequence: GateSequence,
  quorum: Quorum,
  controllerChain: ControllerChain,
  schedulerCycle: SchedulerCycle,
  binding: Binding,
  handoff: Handoff,
  sandbox: Sandbox,
  cniExec: CniExec,
  layers: Layers,
  probes: Probes,
  endpoints: Endpoints,
  dataPlane: DataPlane,
  packetJourney: PacketJourney,
  failureMap: FailureMap,
  spineRecap: SpineRecap,
  // series connective tissue
  spineLocator: SpineLocator,
  // module 01 — Who Owns What
  componentMap: ComponentMap,
  contractBoundary: ContractBoundary,
  storeContents: StoreContents,
  controllerFamily: ControllerFamily,
  outageMatrix: OutageMatrix,
  frozenCluster: FrozenCluster,
  // module 02 — Five Gates
  authGates: AuthGates,
  webhookBlast: WebhookBlast,
  failurePolicy: FailurePolicy,
  webhookChecklist: WebhookChecklist,
  rejectionLadder: RejectionLadder,
  optimisticConcurrency: OptimisticConcurrency,
  managedFields: ManagedFields,
  // module 03 — Events Are Hints
  informerLoop: InformerLoop,
  workqueue: Workqueue,
  levelVsEdge: LevelVsEdge,
  relist: Relist,
  hotLoop: HotLoop,
  externalState: ExternalState,
  resyncTick: ResyncTick,
  queueProperties: QueueProperties,
  controllerSignals: ControllerSignals,
  // module 04 — Four Different Promises
  workloadMatrix: WorkloadMatrix,
  statefulLimit: StatefulLimit,
  coverageVsCompletion: CoverageVsCompletion,
  autoscalerConflict: AutoscalerConflict,
  autoscalerFix: AutoscalerFix,
  pdbScope: PdbScope,
  threeDeaths: ThreeDeaths,
  rolloutMechanics: RolloutMechanics,
  readinessThrottle: ReadinessThrottle,
  jobNumbers: JobNumbers,
  // module 05 — An API You Cannot Take Back
  fourWords: FourWords,
  crdAlone: CrdAlone,
  specStatus: SpecStatus,
  apiContract: ApiContract,
  servedStored: ServedStored,
  migrationOrder: MigrationOrder,
  finalizers: Finalizers,
  forceRemove: ForceRemove,
  schemaSemantics: SchemaSemantics,
  validateEarly: ValidateEarly,
  operatorTest: OperatorTest,
  // module 06 — Choose, Then Commit
  twoCycles: TwoCycles,
  reserveUnreserve: ReserveUnreserve,
  requestsVsUsage: RequestsVsUsage,
  requestErrors: RequestErrors,
  pendingLadder: PendingLadder,
  nominatedNode: NominatedNode,
  preemptionPolicy: PreemptionPolicy,
  // module 07 — Running Is Not Ready
  kubeletLoop: KubeletLoop,
  nodeSequence: NodeSequence,
  fourBoundaries: FourBoundaries,
  criVsOci: CriVsOci,
  phaseVsHealth: PhaseVsHealth,
  trafficChain: TrafficChain,
  terminationRace: TerminationRace,
  staleStatus: StaleStatus,
};

/** Fallback used only if a beat introduces a visual.type with no component. */
export function MissingVisual({ beat }: VisualProps) {
  return (
    <BoxC borderColor={PALETTE.bad} pad={20} style={{ textAlign: 'center' }}>
      <Label color={PALETTE.bad} size={12}>missing visual for type</Label>
      <div style={{ fontFamily: 'monospace', fontSize: 22, color: PALETTE.ink }}>{beat.visual.type}</div>
    </BoxC>
  );
}

import { Box as BoxC, Label } from '../ui';
import { PALETTE } from '../theme';

export function resolveVisual(type: string) {
  return VISUALS[type] ?? MissingVisual;
}
