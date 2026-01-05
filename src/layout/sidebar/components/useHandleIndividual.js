import { newDirect } from "@/redux/features/channels/directSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const useHandleIndividual = () => {
  const userId = useSelector((state) => state.auth.user.id);
  const { workspace_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleFunction = (u) => {
    console.log('hey',u)
    const ids = [(u.id ? u.id : u.ua.id), userId].sort()
    const token = ids[0].slice(0, 6) + ids[1].slice(0, 6);
    navigate(`/workspace/${workspace_id}/individual/${token}`);
    dispatch(newDirect(u));
  };
  return handleFunction;
};
export default useHandleIndividual;
