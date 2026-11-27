import { API_URL } from "../../config/api";
import { Neighborhood } from "./neighborhoodTypes";

export async function fetchNeighborhoods(): Promise<Neighborhood[]> {

  const response = await fetch(`${API_URL}/api/neighborhoods`, {

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error fetching neighborhoods');
  }

  console.log(data.message);
  return data.neighborhood; 
}