const MANIFEST = {
  "type": "Layout.DataTable",
  "description": "Configurable data table with headers and rows. Sophisticated, minimal styling with optional alternating rows and hover states.",
  "editorElement": {
    "selector": ".data-table",
    "displayName": "Data Table",
    "archetype": "container",
    "data": {
      "columnHeaders": {
        "dataType": "text",
        "displayName": "Column Headers",
        "defaultValue": "Name,Email,Role",
        "group": "Content",
        "description": "Comma-separated column titles"
      },
      "tableRows": {
        "dataType": "text",
        "displayName": "Table Rows",
        "defaultValue": "John Doe,john@example.com,Admin\nJane Smith,jane@example.com,Editor\nAlex Brown,alex@example.com,Viewer",
        "group": "Content",
        "description": "One row per line; cells separated by commas"
      },
      "showHeader": {
        "dataType": "booleanValue",
        "displayName": "Show Header Row",
        "defaultValue": "true",
        "group": "Content"
      },
      "emptyMessage": {
        "dataType": "text",
        "displayName": "Empty State Message",
        "defaultValue": "Add column headers and row data to display the table.",
        "group": "Content"
      },
      "stripedRows": {
        "dataType": "booleanValue",
        "displayName": "Alternating Row Colors",
        "defaultValue": "false",
        "group": "Content"
      },
      "backgroundColor": {
        "dataType": "color",
        "displayName": "Background",
        "defaultValue": "#FFFFFF",
        "group": "Colors"
      },
      "headerBackgroundColor": {
        "dataType": "color",
        "displayName": "Header Background",
        "defaultValue": "#FAFAFA",
        "group": "Colors"
      },
      "headerTextColor": {
        "dataType": "color",
        "displayName": "Header Text",
        "defaultValue": "#18181B",
        "group": "Colors"
      },
      "textColor": {
        "dataType": "color",
        "displayName": "Cell Text",
        "defaultValue": "#3F3F46",
        "group": "Colors"
      },
      "borderColor": {
        "dataType": "color",
        "displayName": "Border",
        "defaultValue": "#E4E4E7",
        "group": "Colors"
      },
      "hoverBackgroundColor": {
        "dataType": "color",
        "displayName": "Row Hover",
        "defaultValue": "#F4F4F5",
        "group": "Colors"
      },
      "alternatingRowColor": {
        "dataType": "color",
        "displayName": "Alternating Row",
        "defaultValue": "#FAFAFA",
        "group": "Colors"
      },
      "emptyStateTextColor": {
        "dataType": "color",
        "displayName": "Empty State Text",
        "defaultValue": "#71717A",
        "group": "Colors"
      },
      "fontSize": {
        "dataType": "select",
        "displayName": "Cell Font Size (px)",
        "defaultValue": "14",
        "options": ["12", "14", "16", "18"],
        "group": "Typography"
      },
      "headerFontSize": {
        "dataType": "select",
        "displayName": "Header Font Size (px)",
        "defaultValue": "14",
        "options": ["12", "14", "16", "18"],
        "group": "Typography"
      },
      "fontWeight": {
        "dataType": "select",
        "displayName": "Cell Font Weight",
        "defaultValue": "400",
        "options": ["300", "400", "500"],
        "group": "Typography"
      },
      "headerFontWeight": {
        "dataType": "select",
        "displayName": "Header Font Weight",
        "defaultValue": "500",
        "options": ["300", "400", "500"],
        "group": "Typography"
      },
      "cellPadding": {
        "dataType": "select",
        "displayName": "Cell Padding (px)",
        "defaultValue": "12",
        "options": ["8", "10", "12", "16", "20"],
        "group": "Layout"
      },
      "borderRadius": {
        "dataType": "select",
        "displayName": "Corner Radius (px)",
        "defaultValue": "8",
        "options": ["0", "4", "6", "8", "12"],
        "group": "Layout"
      },
      "borderWidth": {
        "dataType": "select",
        "displayName": "Border Width (px)",
        "defaultValue": "1",
        "options": ["0", "1", "2"],
        "group": "Layout"
      }
    },
    "layout": {
      "resizeDirection": "horizontalAndVertical",
      "contentResizeDirection": "vertical"
    }
  }
};

function Component({ config = {} }) {
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const columnHeadersStr = config?.columnHeaders || 'Name,Email,Role';
  const tableRowsStr = config?.tableRows || '';
  const showHeader = config?.showHeader !== false;
  const emptyMessage = config?.emptyMessage || 'Add column headers and row data to display the table.';
  const stripedRows = config?.stripedRows === true;

  const backgroundColor = config?.backgroundColor || '#FFFFFF';
  const headerBackgroundColor = config?.headerBackgroundColor || '#FAFAFA';
  const headerTextColor = config?.headerTextColor || '#18181B';
  const textColor = config?.textColor || '#3F3F46';
  const borderColor = config?.borderColor || '#E4E4E7';
  const hoverBackgroundColor = config?.hoverBackgroundColor || '#F4F4F5';
  const alternatingRowColor = config?.alternatingRowColor || '#FAFAFA';
  const emptyStateTextColor = config?.emptyStateTextColor || '#71717A';

  const fontSize = parseInt(config?.fontSize || '14', 10);
  const headerFontSize = parseInt(config?.headerFontSize || '14', 10);
  const fontWeight = config?.fontWeight || '400';
  const headerFontWeight = config?.headerFontWeight || '500';
  const cellPadding = parseInt(config?.cellPadding || '12', 10);
  const borderRadius = parseInt(config?.borderRadius || '8', 10);
  const borderWidth = parseInt(config?.borderWidth || '1', 10);

  const headers = React.useMemo(() => {
    return (columnHeadersStr || '')
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);
  }, [columnHeadersStr]);

  const rows = React.useMemo(() => {
    if (!tableRowsStr || !tableRowsStr.trim()) return [];
    return tableRowsStr
      .split('\n')
      .map(line => line.split(',').map(c => c.trim()))
      .filter(cells => cells.some(c => c.length > 0));
  }, [tableRowsStr]);

  const hasData = headers.length > 0 && rows.length > 0;
  const transitionMs = prefersReducedMotion ? 0 : 200;

  if (!hasData) {
    return (
      <div
        className="data-table"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          borderRadius: borderRadius + 'px',
          border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
          boxSizing: 'border-box'
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '16px',
            color: emptyStateTextColor,
            textAlign: 'center',
            maxWidth: '360px'
          }}
        >
          {emptyMessage}
        </p>
      </div>
    );
  }

  const borderStyle = borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none';

  return (
    <div
      className="data-table"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor,
        borderRadius: borderRadius + 'px',
        border: borderStyle,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        boxSizing: 'border-box'
      }}
    >
      <table
        role="grid"
        aria-readonly="true"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          borderSpacing: 0,
          tableLayout: 'auto'
        }}
      >
        {showHeader && headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  style={{
                    padding: cellPadding + 'px',
                    textAlign: 'left',
                    fontSize: headerFontSize + 'px',
                    fontWeight: headerFontWeight,
                    color: headerTextColor,
                    backgroundColor: headerBackgroundColor,
                    borderBottom: borderStyle,
                    borderRight: index < headers.length - 1 ? borderStyle : 'none'
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((cells, rowIndex) => {
            const isEven = rowIndex % 2 === 0;
            const rowBg = stripedRows
              ? (isEven ? backgroundColor : alternatingRowColor)
              : backgroundColor;
            return (
              <tr
                key={rowIndex}
                style={{
                  backgroundColor: rowBg,
                  transition: prefersReducedMotion ? 'none' : `background-color ${transitionMs}ms ease-out`
                }}
                onMouseEnter={(e) => {
                  if (prefersReducedMotion) return;
                  e.currentTarget.style.backgroundColor = hoverBackgroundColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = rowBg;
                }}
              >
                {headers.map((_, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={{
                      padding: cellPadding + 'px',
                      fontSize: fontSize + 'px',
                      fontWeight,
                      color: textColor,
                      borderBottom: borderStyle,
                      borderRight: cellIndex < headers.length - 1 ? borderStyle : 'none'
                    }}
                  >
                    {cells[cellIndex] ?? ''}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
