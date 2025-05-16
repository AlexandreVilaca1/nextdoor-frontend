import { Neighborhood } from "./neighborhoodTypes";

export async function fetchNeighborhoods(): Promise<Neighborhood[]> {

  const response = await fetch('http://localhost:3000/api/neighborhoods', {

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error fetching neighborhoods');
  }

  console.log(data.message);
  return data.neighborhood; 
}