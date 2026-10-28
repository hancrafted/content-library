import styles from './ai-disciplines.module.css';
import type { SceneWords } from './ai-disciplines.types';
import { ChatSceneView } from './chat-scene-view';
import { FactorySceneView } from './factory-scene-view';
import type { Discipline, Frame } from './scene-frames.pure';
import { WorkflowSceneView } from './workflow-scene-view';

/** Side by side, each message leaves a beat after the one before. */
const STAGGER_MS = 100;

/** The wire to the model, with the messages on their way down or back up. */
function Wire({ dot }: { readonly dot: Frame['dot'] }) {
  return (
    <div aria-hidden="true" className={`${styles.wire} relative flex w-16 justify-center gap-1.5`}>
      <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-(--tone)/50" />
      {dot &&
        Array.from({ length: dot.count }, (_, index) => (
          <span
            key={`${dot?.dir}-${index}`}
            data-dir={dot?.dir}
            style={{ animationDelay: `${index * STAGGER_MS}ms` }}
            className={`${styles.dot} relative size-3.5 rounded-sm bg-(--tone) ring-3 ring-(--tone)/25`}
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
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p className="text-body font-semibold text-(--tone)">{props.interfaceName}</p>
        <p className="text-caption text-muted-foreground">{props.interfaceHint}</p>
        <Wire dot={frame.dot} />
      </div>
    </>
  );
}
