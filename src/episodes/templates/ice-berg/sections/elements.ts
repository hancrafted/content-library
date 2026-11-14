import { aiAgent } from '../slides/ai-agent/slide';
import { captain } from '../slides/captain/slide';
import { console } from '../slides/console/slide';
import { elements as section } from '../slides/elements/slide';
import { emote } from '../slides/emote/slide';
import { iceberg } from '../slides/iceberg/slide';
import { pilot } from '../slides/pilot/slide';
import { robot } from '../slides/robot/slide';
import { seaLife } from '../slides/sea-life/slide';
import { ship } from '../slides/ship/slide';
import { sky } from '../slides/sky/slide';

export const elements = [section, robot, pilot, ship, captain, iceberg, seaLife, console, sky, emote, aiAgent] as const;
