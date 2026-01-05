/**
 * Local reducer
 * @param {boolean} showDeleteDialog .
 * @param {string} selectedMessageId
 * @param {boolean} showDeleteSuccess
 */

const initialState = {
  showDeleteDialog: false,
  selectedMessageId: null,
  showDeleteSuccess: false,

  showForwardDialog: false,
  showForwardSuccess: false,

  showEditDialog: false,
  showEditSuccess: false,
};

function __reducer_local(state, action) {
  switch (action.type) {
    // --- existing delete logic ---
    case CASES.OPEN_DELETE_DIALOG:
      return {
        ...state,
        showDeleteDialog: true,
        selectedMessageId: action.payload,
      };
    case CASES.SHOW_DELETE_SUCCESS:
      return { ...state, showDeleteSuccess: true };
    case CASES.CLOSE_DELETE_DIALOG:
      return { ...state, showDeleteDialog: false, selectedMessageId: null };
    case CASES.HIDE_DELETE_SUCCESS:
      return { ...state, showDeleteSuccess: false };

    // --- 🆕 new forward logic ---
    case CASES.OPEN_FORWARD_DIALOG:
      return {
        ...state,
        showForwardDialog: true,
        selectedMessageId: action.payload,
      };
    case CASES.SHOW_FORWARD_SUCCESS:
      return { ...state, showForwardSuccess: true };
    case CASES.CLOSE_FORWARD_DIALOG:
      return { ...state, showForwardDialog: false, selectedMessageId: null };
    case CASES.HIDE_FORWARD_SUCCESS:
      return { ...state, showForwardSuccess: false };
    case CASES.OPEN_EDIT_DIALOG:
      return {
        ...state,
        showEditDialog: true,
        selectedMessage: action.payload,
      };
    case CASES.CLOSE_EDIT_DIALOG:
      return { ...state, showEditDialog: false, selectedMessage: null }
    case CASES.SHOW_EDIT_SUCCESS:
      return { ...state, showEditSuccess: true };
    case CASES.HIDE_EDIT_SUCCESS:
      return { ...state, showEditSuccess: false };
    default:
      return state;
  }
}

export { initialState, __reducer_local };

const CASES = {
  SHOW_DELETE_SUCCESS: "SHOW_DELETE_SUCCESS",
  OPEN_DELETE_DIALOG: "OPEN_DELETE_DIALOG",
  CLOSE_DELETE_DIALOG: "CLOSE_DELETE_DIALOG",
  HIDE_DELETE_SUCCESS: "HIDE_DELETE_SUCCESS",

  // 🆕 forward message
  SHOW_FORWARD_SUCCESS: "SHOW_FORWARD_SUCCESS",
  OPEN_FORWARD_DIALOG: "OPEN_FORWARD_DIALOG",
  CLOSE_FORWARD_DIALOG: "CLOSE_FORWARD_DIALOG",
  HIDE_FORWARD_SUCCESS: "HIDE_FORWARD_SUCCESS",
  //EDIT DIALOG
  SHOW_EDIT_SUCCESS: "SHOW_EDIT_SUCCESS",
  OPEN_EDIT_DIALOG: "OPEN_EDIT_DIALOG",
  HIDE_EDIT_SUCCESS: "HIDE_EDIT_SUCCESS",
  CLOSE_EDIT_DIALOG: "CLOSE_EDIT_DIALOG"
};
