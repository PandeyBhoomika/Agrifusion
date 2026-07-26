import AsyncStorage from "@react-native-async-storage/async-storage";
import { activityEngine } from "../engine/activity.engine";

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://10.0.2.2:4000/api";

class ProofService {

  async submitProof(
    taskId: string,
    photo: any,
    audio?: any,
    location?: {
      lat: number;
      lon: number;
      time: string;
    }
  ) {

    try {

      const token =
        await AsyncStorage.getItem("authToken");

      const formData = new FormData();

      formData.append("taskId", taskId);

      if (location) {

        formData.append(
          "location",
          JSON.stringify(location)
        );

      }

      formData.append("photo", {
        uri: photo.uri,
        type: photo.mimeType || "image/jpeg",
        name: photo.fileName || "photo.jpg",
      } as any);

      if (audio) {

        formData.append("audio", {
          uri: audio.uri,
          type: audio.mimeType || "audio/mpeg",
          name: audio.fileName || "audio.mp3",
        } as any);

      }

      const res = await fetch(
        `${API_BASE}/proofs/submit`,
        {
          method: "POST",

          headers: {

            Authorization: `Bearer ${token}`

          },

          body: formData,

        }
      );

      const data = await res.json();

      if (!res.ok) {

        throw new Error(
          data.message || "Submission failed."
        );

      }

      /**
       * For now:
       * Backend auto approves.
       *
       * Later this becomes
       * TASK_PROOF_PENDING
       */

      await activityEngine.process(
        "TASK_PROOF_APPROVED",
        data
      );

      return data;

    } catch (err) {

      console.error(err);

      throw err;

    }

  }

}

export const proofService =
  new ProofService();