import { LuzmoVizItemComponent } from "@luzmo/react-embed";
import "./FlexComponent.css";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import React from "react";

const FlexComponent = React.forwardRef(
  (
    {
      style,
      className,
      onMouseDown,
      onMouseUp,
      onTouchEnd,
      children,
      ...props
    },
    ref
  ) => {
    const { flexOptions } = props;
    return (
      <div
        style={{ ...style }}
        className={"flexComponent " + className}
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}>
        <OpenWithIcon
          className="drag-handle"
          color="secondary"
          style={{ position: "absolute", top: 2, left: 2, zIndex: 1000 }}
        />
        <LuzmoVizItemComponent
          className="luzmo-viz-item"
          type={flexOptions.type}
          options={flexOptions.options}
          slots={flexOptions.slots}
          filters={flexOptions.filters || null}
          canFilter="all"></LuzmoVizItemComponent>
        {children}
      </div>
    );
  }
);

export default FlexComponent;
