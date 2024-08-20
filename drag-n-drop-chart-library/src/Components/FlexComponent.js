
import { LuzmoVizItemComponent } from "@luzmo/react-embed";

export default function FlexComponent ({ flexAuthorization, flexOptions }) {
    return (
          <LuzmoVizItemComponent
            authKey={flexAuthorization.authKey}
            authToken={flexAuthorization.authToken}
            type={flexOptions.type}
            options={flexOptions.options}
        slots={flexOptions.slots}
        filters={flexOptions.filters || null} 
            canFilter='all'
          ></LuzmoVizItemComponent>
    );
 };
