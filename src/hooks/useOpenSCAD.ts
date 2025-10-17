import { useEffect, useState } from 'react';
import { Model } from '../state/model';
import { State, StatePersister } from '../state/app-state';
import { createEditorFS } from '../fs/filesystem';
import { registerOpenSCADLanguage } from '../language/openscad-register-language';
import { zipArchives } from '../fs/zip-archives';

export interface UseOpenSCADConfig {
  initialState: State;
  statePersister?: StatePersister;
}

export interface UseOpenSCADReturn {
  model: Model | null;
  fs: FS | null;
  isReady: boolean;
  error: Error | null;
}

export function useOpenSCAD(config: UseOpenSCADConfig): UseOpenSCADReturn {
  const [model, setModel] = useState<Model | null>(null);
  const [fs, setFs] = useState<FS | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<State>(config.initialState);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Create filesystem
        const filesystem = await createEditorFS({ prefix: '/tmp', allowPersistence: false }); // TODO: Support standalone mode

        if (!mounted) return;

        // Register OpenSCAD language for Monaco editor
        await registerOpenSCADLanguage(filesystem, '/', zipArchives);

        if (!mounted) return;

        // Create model
        const modelInstance = new Model(
          filesystem,
          config.initialState,
          setState,
          config.statePersister
        );

        // Initialize model
        await modelInstance.init();

        if (!mounted) return;

        setFs(filesystem);
        setModel(modelInstance);
        setIsReady(true);
      } catch (err) {
        if (!mounted) return;
        setError(err as Error);
        console.error('Failed to initialize OpenSCAD:', err);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return { model, fs, isReady, error };
}
