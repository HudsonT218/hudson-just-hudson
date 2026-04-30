import { Suspense, useEffect, useRef, useState } from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import type { SiteSpec } from '@/lib/configurator-types';
import { THEME_DEFINITIONS } from '@/lib/configurator-constants';
import { COMPONENT_REGISTRY } from '@/component-library/registry';
import { cn } from '@/lib/utils';

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS: Record<Device, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
};

interface LivePreviewProps {
  spec: SiteSpec;
}

export function LivePreview({ spec }: LivePreviewProps) {
  const [device, setDevice] = useState<Device>('desktop');
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function update() {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 32;
      const targetWidth = DEVICE_WIDTHS[device];
      setScale(Math.min(1, containerWidth / targetWidth));
    }
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [device]);

  const theme = THEME_DEFINITIONS.find((t) => t.id === spec.theme);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border bg-background">
        <div className="text-xs font-medium text-muted-foreground">
          Live preview · {theme?.name ?? 'No theme'}
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <DeviceButton active={device === 'desktop'} onClick={() => setDevice('desktop')}>
            <Monitor className="h-3.5 w-3.5" />
          </DeviceButton>
          <DeviceButton active={device === 'tablet'} onClick={() => setDevice('tablet')}>
            <Tablet className="h-3.5 w-3.5" />
          </DeviceButton>
          <DeviceButton active={device === 'mobile'} onClick={() => setDevice('mobile')}>
            <Smartphone className="h-3.5 w-3.5" />
          </DeviceButton>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto p-4 bg-muted/50">
        <div
          className="mx-auto bg-background shadow-md rounded-md origin-top transition-transform"
          style={{
            width: DEVICE_WIDTHS[device],
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {/* The data-theme on this wrapper applies the chosen theme tokens
              to the rendered components. */}
          <div data-theme={spec.theme ?? 'clean-modern'} className="bg-background">
            <PreviewContent spec={spec} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-1.5 rounded transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground/70 hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function PreviewContent({ spec }: { spec: SiteSpec }) {
  if (!spec.model) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground/70">Pick a model and theme to start previewing.</p>
      </div>
    );
  }
  if (spec.sections.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground/70">
        Add sections in step 3 to see them here.
      </div>
    );
  }

  return (
    <div>
      {spec.sections.map((s, i) => (
        <PreviewSection
          key={`${s.type}-${i}`}
          variant={s.variant}
          content={spec.content[s.type] ?? {}}
        />
      ))}
    </div>
  );
}

function PreviewSection({
  variant,
  content,
}: {
  variant: string;
  content: Record<string, unknown>;
}) {
  const Component = COMPONENT_REGISTRY[variant];
  if (!Component) {
    return (
      <div className="border-t border-border bg-muted p-6 text-sm text-muted-foreground/70">
        Unknown variant: <code className="font-mono">{variant}</code>
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className="p-12 text-muted-foreground/70 text-sm">Loading {variant}…</div>
      }
    >
      <Component {...content} />
    </Suspense>
  );
}
