import React from 'react';
import { OpenSCADPlayground } from '../../src/OpenSCADPlayground';
import type { CustomizerValues, CustomizerValuesInput, Parameter } from '../../src/state/customizer-types';

type GroupedParameters = Record<string, Parameter[]>;

function groupParameters(parameters: Parameter[]): GroupedParameters {
  return parameters.reduce((acc, param) => {
    if (!acc[param.group]) {
      acc[param.group] = [];
    }
    acc[param.group].push(param);
    return acc;
  }, {} as GroupedParameters);
}

function getDisplayValue(
  name: string,
  overrides: CustomizerValuesInput,
  values: CustomizerValues,
  parameter: Parameter
) {
  if (overrides[name] !== undefined) return overrides[name];
  if (values[name]) return values[name].value;
  return parameter.initial;
}

export function CustomCustomizerPage() {
  const [parameters, setParameters] = React.useState<Parameter[]>([]);
  const [values, setValues] = React.useState<CustomizerValues>({});
  const [overrides, setOverrides] = React.useState<CustomizerValuesInput>({});

  const groupedParameters = React.useMemo(() => groupParameters(parameters), [parameters]);

  const handleParameterChange = React.useCallback((name: string, value: CustomizerValuesInput[string]) => {
    setOverrides((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const resetOverrides = React.useCallback(() => {
    setOverrides({});
  }, []);

  const loadCurrentValues = React.useCallback(() => {
    setOverrides(
      Object.fromEntries(
        Object.entries(values).map(([key, entry]) => [key, entry.value])
      )
    );
  }, [values]);

  const renderControl = React.useCallback(
    (parameter: Parameter) => {
      const name = parameter.name;
      const currentValue = getDisplayValue(name, overrides, values, parameter);

      if (parameter.type === 'boolean') {
        return (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={Boolean(currentValue)}
              onChange={(event) => handleParameterChange(name, event.target.checked)}
            />
            <span>Enabled</span>
          </label>
        );
      }

      if ('options' in parameter && parameter.options?.length) {
        return (
          <select
            value={String(currentValue)}
            onChange={(event) => handleParameterChange(name, event.target.value)}
            style={{ padding: '4px 8px', borderRadius: 4 }}
          >
            {parameter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        );
      }

      if (parameter.type === 'string') {
        return (
          <input
            type="text"
            value={String(currentValue ?? '')}
            onChange={(event) => handleParameterChange(name, event.target.value)}
            style={{ width: '100%', padding: '4px 8px' }}
          />
        );
      }

      if (Array.isArray(parameter.initial)) {
        const arrayValue = Array.isArray(currentValue) ? currentValue : parameter.initial;
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {arrayValue.map((val, index) => (
              <input
                key={`${name}-${index}`}
                type="number"
                value={Number(arrayValue[index])}
                onChange={(event) => {
                  const next = [...arrayValue];
                  next[index] = Number(event.target.value);
                  handleParameterChange(name, next);
                }}
                style={{ width: 70 }}
              />
            ))}
          </div>
        );
      }

      const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
        value: Number(currentValue),
        type: 'number',
        onChange: (event) => handleParameterChange(name, Number(event.target.value)),
        style: { width: '100%', padding: '4px 8px' },
      };

      if ('min' in parameter) inputProps.min = parameter.min;
      if ('max' in parameter) inputProps.max = parameter.max;
      if ('step' in parameter) inputProps.step = parameter.step;

      return <input {...inputProps} />;
    },
    [handleParameterChange, overrides, values]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ padding: '12px 16px', background: '#101623', color: '#fff', borderRadius: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Custom Customizer Panel</h2>
        <p style={{ margin: '8px 0 0', color: '#d7dbf5' }}>
          This page demonstrates binding OpenSCAD customizer parameters to a bespoke React UI. Use the controls on the
          left to adjust values; the playground rerenders instantly via JSON payloads.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        <aside
          style={{
            width: 340,
            border: '1px solid #1f2933',
            borderRadius: 8,
            padding: 16,
            overflow: 'auto',
            background: '#0b1120',
            color: '#dce3ff',
          }}
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={resetOverrides} style={buttonStyles}>
              Reset overrides
            </button>
            <button onClick={loadCurrentValues} style={buttonStyles}>
              Sync from playground
            </button>
          </div>

          {Object.keys(groupedParameters).length === 0 ? (
            <p style={{ color: '#98a2c3' }}>Waiting for customizer schema…</p>
          ) : (
            Object.entries(groupedParameters).map(([group, params]) => (
              <section key={group} style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {group}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {params.map((param) => (
                    <div
                      key={param.name}
                      style={{
                        padding: 12,
                        borderRadius: 6,
                        background: '#111a2e',
                        border: '1px solid #1f2b44',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{param.name}</strong>
                        <span style={{ fontSize: 12, color: '#8da1c4' }}>{param.type}</span>
                      </div>
                      {param.caption && (
                        <p style={{ margin: '4px 0 8px', color: '#9fb3d8', fontSize: 13 }}>{param.caption}</p>
                      )}
                      {renderControl(param)}
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </aside>

        <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          <OpenSCADPlayground
            initialFiles={{
              'custom-panel.scad': `// Parametric enclosure with grouped customizer fields

/* [Body] */
body_width = 80;
body_depth = 48;
body_height = 24;

/* [Fillets] */
corner_radius = 6;

/* [Lid] */
lid_height = 3;
lid_lip_height = 2;

/* [Features] */
add_screw_holes = true;
screw_hole_radius = 2.2;
screw_hole_spacing = 18;

module enclosure_body() {
  hull() {
    for (x=[-body_width/2 + corner_radius, body_width/2 - corner_radius]) {
      for (y=[-body_depth/2 + corner_radius, body_depth/2 - corner_radius]) {
        translate([x, y, 0]) cylinder(h=body_height, r=corner_radius, center=false);
      }
    }
  }
}

module lid_outline(extra=0) {
  offset(r=corner_radius + extra) square([body_width - 2*corner_radius, body_depth - 2*corner_radius], center=true);
}

module screw_holes() {
  if (add_screw_holes) {
    for (x=[-screw_hole_spacing, screw_hole_spacing]) {
      for (y=[-screw_hole_spacing, screw_hole_spacing]) {
        translate([x, y, -1]) cylinder(h=body_height + 2, r=screw_hole_radius, center=false);
      }
    }
  }
}

difference() {
  enclosure_body();
  translate([0,0, lid_height]) cube([body_width - 4, body_depth - 4, body_height], center=true);
  screw_holes();
}

translate([0,0,body_height - lid_height])
linear_extrude(height=lid_height)
lid_outline(0);
`
            }}
            layout="multi"
            initialState={{
              view: {
                layout: {
                  mode: 'multi',
                  editor: true,
                  viewer: true,
                  customizer: false,
                },
                color: '#f9d72c',
              },
            }}
            customizerValues={overrides}
            onCustomizerValuesChange={setValues}
            onParametersChange={setParameters}
          />
        </div>
      </div>
    </div>
  );
}

const buttonStyles: React.CSSProperties = {
  flex: 1,
  padding: '6px 8px',
  border: '1px solid #2e3b59',
  borderRadius: 4,
  background: '#172036',
  color: '#dce3ff',
  cursor: 'pointer',
};

export default CustomCustomizerPage;

