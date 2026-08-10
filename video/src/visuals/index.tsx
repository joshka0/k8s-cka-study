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
// module 08
import { ThreeOwners } from './ThreeOwners';
import { HeadlessService } from './HeadlessService';
import { PolicyNotPath } from './PolicyNotPath';
import { BeyondBigO } from './BeyondBigO';
import { ConntrackMoves } from './ConntrackMoves';
import { WhoExecs } from './WhoExecs';
import { IpamDelegation } from './IpamDelegation';
import { TraceTimeout } from './TraceTimeout';
// module 09
import { ResolvConf } from './ResolvConf';
import { NdotsAmplification } from './NdotsAmplification';
import { TrailingDot } from './TrailingDot';
import { NodeLocalCache } from './NodeLocalCache';
import { ResolveTrace } from './ResolveTrace';
import { DnsIsAService } from './DnsIsAService';
import { CorefileOrder } from './CorefileOrder';
import { WatchedRecords } from './WatchedRecords';
import { FallthroughVsForward } from './FallthroughVsForward';
import { ReadyProvesLittle } from './ReadyProvesLittle';
// module 10
import { ClaimClassVolume } from './ClaimClassVolume';
import { WaitForFirstConsumer } from './WaitForFirstConsumer';
import { PendingClaim } from './PendingClaim';
import { CsiTwoHalves } from './CsiTwoHalves';
import { PrivilegedHalf } from './PrivilegedHalf';
import { ClaimToMount } from './ClaimToMount';
import { StageVsPublish } from './StageVsPublish';
import { TopologyHandshake } from './TopologyHandshake';
import { MountTrace } from './MountTrace';
// module 11
import { TwoAvailabilityModels } from './TwoAvailabilityModels';
import { QuorumMaths } from './QuorumMaths';
import { FourthMember } from './FourthMember';
import { LeaderElection } from './LeaderElection';
import { QuorumLoss } from './QuorumLoss';
import { BackupHypothesis } from './BackupHypothesis';
import { SnapshotOmits } from './SnapshotOmits';
import { DeceptiveMinutes } from './DeceptiveMinutes';
import { SupportedCapture } from './SupportedCapture';
import { ProveRecovery } from './ProveRecovery';
// module 12
import { ConcurrencySeats } from './ConcurrencySeats';
import { ClassifyThenServe } from './ClassifyThenServe';
import { ShuffleSharding } from './ShuffleSharding';
import { ContainedNotFixed } from './ContainedNotFixed';
import { InformersAsLoad } from './InformersAsLoad';
import { EvidenceHierarchy } from './EvidenceHierarchy';
import { ObjectIsContract } from './ObjectIsContract';
import { AuditAnswers } from './AuditAnswers';
import { IsolateLayer } from './IsolateLayer';
import { NinetySeconds } from './NinetySeconds';

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
  // module 08 — the packet's second half lives here to keep the spine whole
  threeOwners: ThreeOwners,
  headlessService: HeadlessService,
  policyNotPath: PolicyNotPath,
  beyondBigO: BeyondBigO,
  conntrackMoves: ConntrackMoves,
  whoExecs: WhoExecs,
  ipamDelegation: IpamDelegation,
  traceTimeout: TraceTimeout,
  // module 09 — three names, one path
  resolvConf: ResolvConf,
  ndotsAmplification: NdotsAmplification,
  trailingDot: TrailingDot,
  nodeLocalCache: NodeLocalCache,
  resolveTrace: ResolveTrace,
  dnsIsAService: DnsIsAService,
  corefileOrder: CorefileOrder,
  watchedRecords: WatchedRecords,
  fallthroughVsForward: FallthroughVsForward,
  readyProvesLittle: ReadyProvesLittle,
  // module 10 — outside the API server
  claimClassVolume: ClaimClassVolume,
  waitForFirstConsumer: WaitForFirstConsumer,
  pendingClaim: PendingClaim,
  csiTwoHalves: CsiTwoHalves,
  privilegedHalf: PrivilegedHalf,
  claimToMount: ClaimToMount,
  stageVsPublish: StageVsPublish,
  topologyHandshake: TopologyHandshake,
  mountTrace: MountTrace,
  // module 11 — the storage layer is also a system
  twoAvailabilityModels: TwoAvailabilityModels,
  quorumMaths: QuorumMaths,
  fourthMember: FourthMember,
  leaderElection: LeaderElection,
  quorumLoss: QuorumLoss,
  backupHypothesis: BackupHypothesis,
  snapshotOmits: SnapshotOmits,
  deceptiveMinutes: DeceptiveMinutes,
  supportedCapture: SupportedCapture,
  proveRecovery: ProveRecovery,
  // module 12 — the spine as a diagnostic tool
  concurrencySeats: ConcurrencySeats,
  classifyThenServe: ClassifyThenServe,
  shuffleSharding: ShuffleSharding,
  containedNotFixed: ContainedNotFixed,
  informersAsLoad: InformersAsLoad,
  evidenceHierarchy: EvidenceHierarchy,
  objectIsContract: ObjectIsContract,
  auditAnswers: AuditAnswers,
  isolateLayer: IsolateLayer,
  ninetySeconds: NinetySeconds,
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
