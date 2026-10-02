import SweetAlert from "sweetalert2";

// Shared presentation defaults keep every dialog aligned with the active
// application theme. Theme-specific colors live in designSystem.css.
const Swal = SweetAlert.mixin({
  buttonsStyling: false,
  customClass: {
    popup: "tanfeez-swal",
    title: "tanfeez-swal-title",
    htmlContainer: "tanfeez-swal-content",
    confirmButton: "tanfeez-swal-confirm",
    cancelButton: "tanfeez-swal-cancel",
    denyButton: "tanfeez-swal-deny",
  },
});

export default Swal;
