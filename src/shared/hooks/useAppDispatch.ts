import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';

// Custom hook for typed dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;