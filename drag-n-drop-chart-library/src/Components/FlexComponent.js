
import { LuzmoVizItemComponent } from "@luzmo/react-embed";

export default function FlexComponent ({ flexOptions }) {
    return (
          <LuzmoVizItemComponent
            type={flexOptions.type}
            options={flexOptions.options}
        slots={flexOptions.slots}
        filters={flexOptions.filters || null} 
            canFilter='all'
          ></LuzmoVizItemComponent>
    );
 };
