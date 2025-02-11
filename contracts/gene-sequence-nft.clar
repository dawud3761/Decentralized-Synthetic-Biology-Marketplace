;; Gene Sequence NFT Contract

;; Define the non-fungible token
(define-non-fungible-token gene-sequence uint)

;; Define data structures
(define-map gene-sequences
  { token-id: uint }
  { owner: principal, sequence: (string-ascii 1000), metadata: (string-ascii 256) }
)

(define-data-var last-token-id uint u0)

;; Error codes
(define-constant err-not-token-owner (err u100))
(define-constant err-token-not-found (err u101))

;; Mint a new gene sequence NFT
(define-public (mint-gene-sequence (sequence (string-ascii 1000)) (metadata (string-ascii 256)))
  (let
    ((token-id (+ (var-get last-token-id) u1)))
    (try! (nft-mint? gene-sequence token-id tx-sender))
    (map-set gene-sequences
      { token-id: token-id }
      { owner: tx-sender, sequence: sequence, metadata: metadata }
    )
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

;; Transfer gene sequence NFT
(define-public (transfer-gene-sequence (token-id uint) (recipient principal))
  (let
    ((token-owner (unwrap! (nft-get-owner? gene-sequence token-id) err-token-not-found)))
    (asserts! (is-eq tx-sender token-owner) err-not-token-owner)
    (try! (nft-transfer? gene-sequence token-id tx-sender recipient))
    (ok true)
  )
)

;; Get gene sequence details
(define-read-only (get-gene-sequence (token-id uint))
  (map-get? gene-sequences { token-id: token-id })
)

;; Get token owner
(define-read-only (get-owner (token-id uint))
  (nft-get-owner? gene-sequence token-id)
)

;; Get last token ID
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)
