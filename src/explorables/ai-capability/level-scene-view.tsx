import styles from './ai-capability.module.css';
import type { SceneWords } from './ai-capability.types';
import { ChatSceneView } from './chat-scene-view';
import { FactorySceneView } from './factory-scene-view';
import { onWire, type Frame, type Level } from './scene-frames.pure';
import { WorkflowSceneView } from './workflow-scene-view';

/** How far apart two lanes of the wire sit. */
const LANE_REM = 0.9;

/** The wire to the model, with the messages on their way down or back up, each on its lane. */
function Wire({ frame }: { readonly frame: Frame }) {
  return (
    <div aria-hidden="true" data-wire="" className={`${styles.wire} relative mx-auto w-20`}>
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

/**
 * A Level's scene, the interface it reaches the model through as the scene's footer, and its wire to the model (a pure
 * view): the frame decides what the scene and the wire show.
 */
export function LevelSceneView(props: {
  readonly level: Level;
  readonly frame: Frame;
  readonly words: SceneWords;
  readonly interfaceName: string;
  readonly interfaceHint: string;
}) {
  const { level, frame, words } = props;
  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-2xl border border-(--tone)/30 bg-(--tone)/5">
        <div className="relative h-40 overflow-hidden">
          {level === 'workflows' && <WorkflowSceneView frame={frame} words={words} />}
          {level === 'factory' && <FactorySceneView frame={frame} label={words.factory} />}
          {(level === 'prompting' || level === 'agents') && <ChatSceneView frame={frame} words={words} />}
        </div>
        <p className="mt-auto border-t border-(--tone)/20 px-3 py-1.5 text-caption text-muted-foreground">
          <span className="font-semibold text-(--tone)">{props.interfaceName}</span> {props.interfaceHint}
        </p>
      </div>
      <Wire frame={frame} />
    </>
  );
}
