import { useEffect, useRef, useState } from 'react';

/** Native top-layer modality supplies inert background, focus containment and Escape handling. */
export function useDashboardLogDialog(eventCount: number) {
  const dialog = useRef<HTMLDialogElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const [follow, setFollow] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  useEffect(() => {
    if (follow && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [follow, eventCount]);
  const onScroll = () => {
    const element = scroll.current;
    if (element && element.scrollHeight - element.scrollTop - element.clientHeight > 24) setFollow(false);
  };
  return { dialog, scroll, follow, setFollow, onScroll, close: () => dialog.current?.close() };
}
