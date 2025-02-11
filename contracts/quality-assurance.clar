;; Quality Assurance Contract

;; Define data structures
(define-map quality-checks
  { check-id: uint }
  { request-id: uint, verifier: principal, result: (string-ascii 20), timestamp: uint }
)

(define-data-var last-check-id uint u0)

;; Error codes
(define-constant err-invalid-check (err u100))
(define-constant err-unauthorized (err u101))

;; Define the contract owner
(define-data-var contract-owner principal tx-sender)

;; Perform a quality check
(define-public (perform-check (request-id uint) (result (string-ascii 20)))
  (let
    ((new-check-id (+ (var-get last-check-id) u1)))
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (map-set quality-checks
      { check-id: new-check-id }
      { request-id: request-id, verifier: tx-sender, result: result, timestamp: block-height }
    )
    (var-set last-check-id new-check-id)
    (ok new-check-id)
  )
)

;; Get check details
(define-read-only (get-check (check-id uint))
  (map-get? quality-checks { check-id: check-id })
)

;; Get last check ID
(define-read-only (get-last-check-id)
  (ok (var-get last-check-id))
)

;; Change contract owner
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (ok (var-set contract-owner new-owner))
  )
)
