import React from "react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const DragHandle = React.forwardRef((props, ref) => {
  const { handleAxis, ...restProps } = props;
  return (
    <div
      ref={ref}
      className={`react-resizable-handle+ react-resizable-handle-${handleAxis}`}
      {...restProps}>
      <KeyboardArrowRightIcon color="secondary" />
    </div>
  );
});

export default DragHandle;
