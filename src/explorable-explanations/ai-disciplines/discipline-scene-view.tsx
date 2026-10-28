import styles from './ai-disciplines.module.css';
import type { SceneWords } from './ai-disciplines.types';
import { ChatSceneView } from './chat-scene-view';
import { FactorySceneView } from './factory-scene-view';
import { onWire, type Discipline, type Frame } from './scene-frames.pure';
import { WorkflowSceneView } from './workflow-scene-view';

/** How far apart two lanes of the wire sit. */
const LANE_REM = 0.9;

/** The wire to the model, with the messages on their way down or back up, each on its lane. */
function Wire({ frame }: { readonly frame: Frame }) {
  return (
    <div aria-hidden="true" data-wire="" className={`${styles.wire} relative mt-auto w-20`}>
      <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-(--tone)/50" />
      {onWire(frame).map(({ key, dir, lane, delay }) => (
        <span
          key={key}
          data-dir={dir}
          style={{ left: `calc(50% + ${lane * LANE_REM}rem)`, animationDelay: `${delay}ms` }}
          className={`${styles.dot} absolute top-0 size-3.5 -translate-x-1/2 rounded-sm bg-(--tone) ring-3 ring-(--tone)/25`}
        />
      ))}
    </div>
  );
}

/** A discipline's scene and its wire to the model (a pure view): the frame decides what the scene and the wire show. */
export function DisciplineSceneView(props: {
  readonly discipline: Discipline;
  readonly frame: Frame;
  readonly words: SceneWords;
  readonly interfaceName: string;
  readonly interfaceHint: string;
}) {
  const { discipline, frame, words } = props;
  return (
    <>
      <div className="relative h-64 overflow-hidden rounded-2xl border border-(--tone)/30 bg-(--tone)/5">
        {discipline === 'workflows' && <WorkflowSceneView frame={frame} words={words} />}
        {discipline === 'factory' && <FactorySceneView frame={frame} label={words.factory} />}
        {(discipline === 'prompting' || discipline === 'agents') && <ChatSceneView frame={frame} words={words} />}
      </div>
      <div className="flex h-full flex-col items-center gap-0.5 text-center">
        <p className="text-body font-semibold text-(--tone)">{props.interfaceName}</p>
        <p className="text-caption text-muted-foreground">{props.interfaceHint}</p>
        <Wire frame={frame} />
      </div>
    </>
  );
}
