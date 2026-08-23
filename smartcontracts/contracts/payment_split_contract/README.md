# Payment Split Contract

A Soroban smart contract for complex payment distribution scenarios including percentage-based splits, conditional releases, milestone-based payments, and recursive splits.

## Features

### Core Functionality

- **Split Configuration**: Support flexible split definitions including:
  - Percentage-based splits (must sum to 100%)
  - Fixed-amount splits
  - Hybrid splits (combination of percentage and fixed)
  - Conditional splits (release based on external conditions)
  - Time-locked splits (release after specific timestamp)
  - Milestone-based splits (release after milestone approval)
  - Recursive splits (splits of splits)

- **Split Execution**: Atomic split execution to prevent partial failures:
  - Validate split configuration before execution
  - Lock funds during split execution
  - Distribute funds to all recipients atomically
  - Handle insufficient funds scenarios gracefully
  - Support partial payments with prorated distribution

- **Recursive Splits**: Nested split structures where recipients can themselves be split contracts:
  - Depth limits to prevent infinite recursion
  - Circular reference detection
  - Gas-optimized recursive execution

- **Refund Handling**: Comprehensive refund logic:
  - Full refunds before execution
  - Partial refunds after partial execution
  - Refund when some recipients have already received funds
  - Refund fee calculation
  - Refund authorization (original payer or admin)

- **Gas Optimization**:
  - Batch operations for multiple recipients
  - Efficient storage patterns
  - Overflow/underflow protection using checked arithmetic

- **Security**:
  - Reentrancy guards
  - Emergency pause functionality
  - Admin-only operations
  - Proper authorization checks

## Contract Functions

### Initialization

```rust
pub fn init(env: Env, config: SplitConfig)
```

Initialize the contract with configuration parameters.

**Parameters:**
- `config`: SplitConfig containing:
  - `max_recipients`: Maximum number of recipients per split
  - `max_retries`: Maximum retry attempts for failed distributions
  - `min_split_percentage`: Minimum percentage per recipient
  - `max_split_percentage`: Maximum percentage per recipient
  - `require_merchant_approval`: Whether merchant approval is required
  - `enable_auto_retry`: Whether to enable automatic retry

### Split Management

#### Create Split

```rust
pub fn create_split(
    env: Env,
    split_id: String,
    payment_id: String,
    merchant_address: Address,
    total_amount: i128,
    currency: Address,
    split_type: SplitType,
    recipients: Vec<Recipient>,
    milestones: Vec<Milestone>,
) -> Result<PaymentSplit, ContractError>
```

Create a new payment split.

**Example:**
```rust
let mut recipients = Vec::new(&env);
recipients.push_back(Recipient {
    address: recipient1,
    percentage: 50,
    fixed_amount: 0,
    split_type: SplitType::Percentage,
    distributed_amount: 0,
    distribution_status: SplitStatus::Pending,
    is_recursive: false,
    recursive_split_id: String::from_str(&env, ""),
});

let split = client.create_split(
    &String::from_str(&env, "split_001"),
    &String::from_str(&env, "payment_001"),
    &merchant,
    &1000,
    &currency,
    &SplitType::Percentage,
    &recipients,
    &Vec::new(&env),
)?;
```

#### Execute Split

```rust
pub fn execute_split(env: Env, split_id: String, executor: Address) -> Result<PaymentSplit, ContractError>
```

Execute a payment split, distributing funds to recipients.

#### Cancel Split

```rust
pub fn cancel_split(env: Env, split_id: String, canceller: Address) -> Result<PaymentSplit, ContractError>
```

Cancel a pending split.

### Distribution Management

#### Distribute to Recipient

```rust
pub fn distribute_to_recipient(
    env: Env,
    distribution_id: String,
    split_id: String,
    recipient_address: Address,
    amount: i128,
) -> Result<SplitDistribution, ContractError>
```

Distribute funds to a specific recipient.

#### Confirm Distribution

```rust
pub fn confirm_distribution(env: Env, distribution_id: String) -> Result<SplitDistribution, ContractError>
```

Mark a distribution as successfully completed.

#### Fail Distribution

```rust
pub fn fail_distribution(env: Env, distribution_id: String, error_message: String) -> Result<SplitDistribution, ContractError>
```

Mark a distribution as failed with an error message.

### Milestone Management

#### Trigger Milestone

```rust
pub fn trigger_milestone(env: Env, split_id: String, milestone_id: String, triggerer: Address) -> Result<Milestone, ContractError>
```

Trigger a milestone for milestone-based splits.

#### Complete Milestone

```rust
pub fn complete_milestone(env: Env, split_id: String, milestone_id: String, completer: Address) -> Result<Milestone, ContractError>
```

Complete a milestone, releasing associated funds.

### Conditional & Time-Locked Splits

#### Verify Condition

```rust
pub fn verify_condition(env: Env, split_id: String, verifier: Address) -> Result<PaymentSplit, ContractError>
```

Verify that a conditional split's conditions are met.

#### Release Time Lock

```rust
pub fn release_time_lock(env: Env, split_id: String, releaser: Address) -> Result<PaymentSplit, ContractError>
```

Release a time-locked split after the lock period expires.

### Recursive Splits

#### Validate Recursive Structure

```rust
pub fn validate_recursive_structure(env: Env, split_id: String) -> Result<(), ContractError>
```

Validate a recursive split structure for circular references and depth limits.

### Refund Management

#### Request Refund

```rust
pub fn request_refund(
    env: Env,
    refund_id: String,
    split_id: String,
    requester: Address,
    refund_amount: i128,
    reason: String,
) -> Result<RefundRequest, ContractError>
```

Request a refund for a split.

#### Approve Refund

```rust
pub fn approve_refund(env: Env, refund_id: String, admin: Address) -> Result<RefundRequest, ContractError>
```

Approve a refund request (admin only).

#### Complete Refund

```rust
pub fn complete_refund(env: Env, refund_id: String) -> Result<RefundRequest, ContractError>
```

Complete a refund after funds have been transferred.

#### Reject Refund

```rust
pub fn reject_refund(env: Env, refund_id: String, admin: Address) -> Result<RefundRequest, ContractError>
```

Reject a refund request (admin only).

### Security Management

#### Pause Contract

```rust
pub fn pause_contract(env: Env, admin: Address) -> Result<(), ContractError>
```

Pause the contract (admin only).

#### Unpause Contract

```rust
pub fn unpause_contract(env: Env, admin: Address) -> Result<(), ContractError>
```

Unpause the contract (admin only).

#### Check if Paused

```rust
pub fn is_contract_paused(env: Env) -> bool
```

Check if the contract is currently paused.

## Data Types

### SplitType

```rust
pub enum SplitType {
    Percentage,      // Percentage-based distribution
    FixedAmount,     // Fixed amount distribution
    Milestone,       // Milestone-based distribution
    Hybrid,          // Combination of percentage and fixed
    Conditional,     // Condition-based release
    TimeLocked,      // Time-locked release
    Recursive,       // Recursive/nested splits
}
```

### SplitStatus

```rust
pub enum SplitStatus {
    Pending,           // Split created but not executed
    Executing,         // Split is currently executing
    Completed,         // Split completed successfully
    PartiallyCompleted,// Some recipients received funds
    Failed,            // Split execution failed
    Cancelled,         // Split was cancelled
    Refunded,          // Split was refunded
    PartiallyRefunded, // Partial refund processed
}
```

### Recipient

```rust
pub struct Recipient {
    pub address: Address,
    pub percentage: i128,
    pub fixed_amount: i128,
    pub split_type: SplitType,
    pub distributed_amount: i128,
    pub distribution_status: SplitStatus,
    pub is_recursive: bool,
    pub recursive_split_id: String,
}
```

### PaymentSplit

```rust
pub struct PaymentSplit {
    pub split_id: String,
    pub payment_id: String,
    pub merchant_address: Address,
    pub total_amount: i128,
    pub currency: Address,
    pub split_type: SplitType,
    pub status: SplitStatus,
    pub recipients: Vec<Recipient>,
    pub milestones: Vec<Milestone>,
    pub conditional_split: ConditionalSplit,
    pub time_locked_split: TimeLockedSplit,
    pub recursive_config: RecursiveSplitConfig,
    pub created_at: u64,
    pub executed_at: u64,
    pub completed_at: u64,
    pub retry_count: u32,
    pub max_retries: u32,
    pub refund_status: RefundStatus,
    pub refunded_amount: i128,
    pub refund_fee: i128,
}
```

## Error Codes

The contract uses the following error codes:

| Error Code | Value | Description |
|------------|-------|-------------|
| SplitNotFound | 1 | Split not found |
| InvalidPercentage | 2 | Invalid percentage value |
| InvalidAmount | 3 | Invalid amount value |
| SplitAlreadyExecuted | 4 | Split already executed |
| SplitCancelled | 5 | Split was cancelled |
| InsufficientBalance | 6 | Insufficient balance |
| InvalidRecipient | 7 | Invalid recipient |
| MilestoneNotTriggered | 8 | Milestone not triggered |
| MaxRetriesExceeded | 9 | Maximum retries exceeded |
| Unauthorized | 10 | Unauthorized access |
| ContractPaused | 11 | Contract is paused |
| ReentrancyDetected | 12 | Reentrancy detected |
| CircularReference | 13 | Circular reference in recursive splits |
| MaxDepthExceeded | 14 | Maximum recursion depth exceeded |
| ConditionNotMet | 15 | Condition not met |
| ConditionExpired | 16 | Condition expired |
| TimeLockNotExpired | 17 | Time lock not expired |
| RefundNotAllowed | 18 | Refund not allowed |
| RefundAlreadyProcessed | 19 | Refund already processed |
| InvalidRefundAmount | 20 | Invalid refund amount |
| Overflow | 21 | Arithmetic overflow |
| Underflow | 22 | Arithmetic underflow |
| InvalidAddress | 23 | Invalid address |
| AdminOnly | 24 | Admin-only operation |

## Building

```bash
# Build the contract
cargo build --target wasm32v1-none --release

# The compiled WASM file will be at:
# target/wasm32v1-none/release/payment_split_contract.wasm
```

## Testing

```bash
# Run tests
cargo test
```

## Deployment

To deploy the contract to Soroban testnet:

```bash
# Install soroban-cli
cargo install soroban-cli

# Deploy the contract
soroban contract deploy --wasm target/wasm32v1-none/release/payment_split_contract.wasm --source <your-address>
```

## Security Considerations

- **Reentrancy Protection**: The contract includes reentrancy guards to prevent reentrancy attacks
- **Authorization**: All sensitive operations require proper authorization checks
- **Pause Functionality**: Admin can pause the contract in case of emergency
- **Overflow Protection**: All arithmetic operations use checked arithmetic to prevent overflow/underflow
- **Circular Reference Detection**: Recursive splits are validated for circular references

## Gas Optimization

The contract implements several gas optimization techniques:
- Efficient storage patterns with minimal reads
- Batch operations for multiple recipients
- Lazy evaluation where possible
- Depth limits on recursive splits

## License

MIT
