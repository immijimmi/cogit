import { useEffect, useRef } from "react";

export function useUpdateEffect(effect, dependencies) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      return effect();
    }

    mounted.current = true;
  }, dependencies);
}
