export const NumberWithBorder = ({ value, style }) => {
  return (
    <div
      style={{
        border: '0.1rem solid #bdbec3',
        padding: '3px 4px',
        borderRadius: '6px',
        fontSize: '12px',
        lineHeight: '10px',
        height: 'fit-content',
        marginTop: 'auto',
        marginBottom: 'auto',
        ...style,
      }}
    >
      {value}
    </div>
  );
};
