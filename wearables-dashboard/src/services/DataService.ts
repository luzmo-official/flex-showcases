import axios from "axios";

const API_BASE_URL = "https://api.luzmo.com/0.1.0";

export type SleepScoreData = {
  lastNightSleepScore: number;
  previousNightSleepScore: number;
};

export type StepsPerDayData = {
  date: string;
  steps: number;
}[];

export async function getSleepScoreLastNight(
  userId: string
): Promise<SleepScoreData> {
  const sleepScoreQuery = {
    dimensions: [
      // Group on day level
      {
        dataset_id: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
        column_id: "3fc71210-6362-4bf6-ba1b-d27d16b1c36d",
        level: 5,
      },
    ],
    measures: [
      // Calculate average sleep score
      {
        dataset_id: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
        column_id: "d0ff1497-fa36-4dce-9480-a03e2f65c5ee",
        aggregation: {
          type: "average",
        },
      },
    ],
    where: [
      // Filter by user ID
      /* IMPORTANT NOTE:
       * This is a simplified example that doesn't use authorization tokens. In a real-world application, you should never pass the user ID directly to the API client-side, as it can be easily manipulated.
       * Instead, always use a user-specific Authorization token that handles the multi-tenancy filtering, and use this key-token pair to retrieve the data.
       */
      {
        expression: "? = ?",
        parameters: [
          {
            column_id: "695b3aee-6772-4aa6-bb50-a67a88bfc26b",
            dataset_id: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
          },
          userId,
        ],
      },
    ],
    order: [
      // Order by day in descending order
      {
        dataset_id: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
        column_id: "3fc71210-6362-4bf6-ba1b-d27d16b1c36d",
        level: 5,
        order: "desc",
      },
    ],
    limit: {
      by: 2,
    },
  };
  try {
    const response = await axios.post(`${API_BASE_URL}/data`, {
      action: "get",
      version: "0.1.0",
      find: { queries: [sleepScoreQuery] },
    });
    const results = response.data.data;
    const output = {
      lastNightSleepScore: -1,
      previousNightSleepScore: -1,
    };
    const currentDate = new Date().toISOString().split("T")[0];

    const previousDate = new Date(currentDate);
    previousDate.setDate(new Date(currentDate).getDate() - 1);

    const dateBeforePreviousDate = new Date(previousDate);
    dateBeforePreviousDate.setDate(new Date(previousDate).getDate() - 1);

    results.forEach((result: any) => {
      const date = result[0].split("T")[0];
      if (
        new Date(previousDate).toISOString() === new Date(date).toISOString()
      ) {
        output.lastNightSleepScore = result[1];
      } else if (
        new Date(dateBeforePreviousDate).toISOString() ===
        new Date(date).toISOString()
      ) {
        output.previousNightSleepScore = result[1];
      } else {
        console.log("Date received is not yesterday or the day before:", date);
      }
    });

    return output;
  } catch (error) {
    console.error("Error fetching sleep score:", error);
    throw error;
  }
}

export async function getStepsPerDay(userId: string): Promise<StepsPerDayData> {
  const stepsPerDayQuery = {
    dimensions: [
      // Group on day level
      {
        dataset_id: "1c759996-74fd-438d-bcba-eb58838a5b03",
        column_id: "87680fa2-96d2-42cf-ae76-557c3996cdf2",
        level: 5,
      },
    ],
    measures: [
      // Calculate total steps (default aggregation is sum)
      {
        dataset_id: "1c759996-74fd-438d-bcba-eb58838a5b03",
        column_id: "27978dfd-7218-40a4-88cf-59de2df91935",
      },
    ],
    where: [
      {
        expression: "? = ?",
        parameters: [
          {
            column_id: "572740ed-aeed-4aeb-b318-d059e8be35a6",
            dataset_id: "1c759996-74fd-438d-bcba-eb58838a5b03",
          },
          userId,
        ],
      },
    ],
    order: [
      // Order by day in descending order
      {
        dataset_id: "1c759996-74fd-438d-bcba-eb58838a5b03",
        column_id: "87680fa2-96d2-42cf-ae76-557c3996cdf2",
        level: 5,
        order: "desc",
      },
    ],
  };
  try {
    const response = await axios.post(`${API_BASE_URL}/data`, {
      action: "get",
      version: "0.1.0",
      find: { queries: [stepsPerDayQuery] },
    });

    return response.data.data.map((result: any) => {
      return {
        date: result[0],
        steps: result[1],
      };
    });
  } catch (error) {
    console.error("Error fetching steps per day:", error);
    throw error;
  }
}
