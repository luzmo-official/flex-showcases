import { LuzmoVizItemComponent } from "@luzmo/react-embed";
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
        className={className}
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}>
        <LuzmoVizItemComponent
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
