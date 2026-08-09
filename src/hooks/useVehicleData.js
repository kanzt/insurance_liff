import { useState, useEffect } from 'preact/hooks';
import { fetchVehicleYears, fetchVehicleMakes, fetchVehicleModels } from '../utils/api';

export function useVehicleData(baseApiUrl, selectedYear, selectedMake) {
  const [years, setYears] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Fetch Years on mount
  useEffect(() => {
    let isMounted = true;
    if (!baseApiUrl) return;
    
    setIsLoadingYears(true);
    fetchVehicleYears(baseApiUrl)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.results) {
          // Format years into { value, label } for SearchableSelect
          setYears(data.results.map(year => ({ value: year, label: year })));
        }
      })
      .catch(err => console.error("Failed to load vehicle years:", err))
      .finally(() => {
        if (isMounted) setIsLoadingYears(false);
      });

    return () => { isMounted = false; };
  }, [baseApiUrl]);

  // Fetch Makes when baseApiUrl or selectedYear changes
  // Note: Backend supports fetching all makes if year is not provided, 
  // but if we want cascading, we might pass the year.
  useEffect(() => {
    let isMounted = true;
    if (!baseApiUrl) return;

    setIsLoadingMakes(true);
    fetchVehicleMakes(baseApiUrl, selectedYear || '')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.results) {
          setMakes(data.results.map(make => ({ value: make.id, label: make.name })));
        }
      })
      .catch(err => console.error("Failed to load vehicle makes:", err))
      .finally(() => {
        if (isMounted) setIsLoadingMakes(false);
      });
      
    return () => { isMounted = false; };
  }, [baseApiUrl, selectedYear]);

  // Fetch Models when selectedMake or selectedYear changes
  useEffect(() => {
    let isMounted = true;
    if (!baseApiUrl || !selectedMake) {
      setModels([]);
      return;
    }

    setIsLoadingModels(true);
    fetchVehicleModels(baseApiUrl, selectedMake, selectedYear || '')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.results) {
          setModels(data.results.map(model => ({ value: model.id, label: model.name })));
        }
      })
      .catch(err => console.error("Failed to load vehicle models:", err))
      .finally(() => {
        if (isMounted) setIsLoadingModels(false);
      });
      
    return () => { isMounted = false; };
  }, [baseApiUrl, selectedMake, selectedYear]);

  return {
    years,
    makes,
    models,
    isLoadingYears,
    isLoadingMakes,
    isLoadingModels
  };
}
