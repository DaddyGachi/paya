#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Vec, Symbol};

mod types;
mod storage;
mod logic;

#[cfg(test)]
mod test;

use crate::types::{
    PaymentSplit, Recipient, Milestone, SplitDistribution, 
    SplitType, ContractError, SplitConfig, RefundRequest, SecurityConfig
};
use crate::logic::{
    create_split, execute_split, distribute_to_recipient, confirm_distribution,
    fail_distribution, trigger_milestone, complete_milestone, cancel_split,
    retry_failed_distributions, validate_recursive_structure,
    verify_condition, release_time_lock, request_refund, approve_refund,
    complete_refund, reject_refund, set_reentrancy_protection,
    clear_reentrancy_protection, pause_contract, unpause_contract, is_contract_paused
};
use crate::storage::{get_split, get_distribution, get_config, set_config};

#[contract]
pub struct PaymentSplitContract;

#[contractimpl]
impl PaymentSplitContract {
    /// Initialize the contract with default configuration
    pub fn init(env: Env, config: SplitConfig) {
        set_config(&env, &config);
    }

    /// Create a new payment split
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
    ) -> Result<PaymentSplit, ContractError> {
        create_split(
            &env,
            split_id,
            payment_id,
            merchant_address,
            total_amount,
            currency,
            split_type,
            recipients,
            milestones,
        )
    }

    /// Execute a payment split (begin distribution)
    pub fn execute_split(env: Env, split_id: String, executor: Address) -> Result<PaymentSplit, ContractError> {
        execute_split(&env, split_id, executor)
    }

    /// Distribute funds to a specific recipient
    pub fn distribute_to_recipient(
        env: Env,
        split_id: String,
        recipient_address: Address,
        amount: i128,
        distribution_id: String,
    ) -> Result<SplitDistribution, ContractError> {
        distribute_to_recipient(&env, split_id, recipient_address, amount, distribution_id)
    }

    /// Confirm a successful distribution
    pub fn confirm_distribution(
        env: Env,
        distribution_id: String,
        transaction_hash: Symbol,
    ) -> Result<SplitDistribution, ContractError> {
        confirm_distribution(&env, distribution_id, transaction_hash)
    }

    /// Mark a distribution as failed
    pub fn fail_distribution(
        env: Env,
        distribution_id: String,
        error_message: String,
    ) -> Result<SplitDistribution, ContractError> {
        fail_distribution(&env, distribution_id, error_message)
    }

    /// Trigger a milestone for milestone-based splits
    pub fn trigger_milestone(
        env: Env,
        split_id: String,
        milestone_id: String,
        triggerer: Address,
    ) -> Result<Milestone, ContractError> {
        trigger_milestone(&env, split_id, milestone_id, triggerer)
    }

    /// Complete a milestone
    pub fn complete_milestone(
        env: Env,
        split_id: String,
        milestone_id: String,
        completer: Address,
    ) -> Result<Milestone, ContractError> {
        complete_milestone(&env, split_id, milestone_id, completer)
    }

    /// Cancel a pending split
    pub fn cancel_split(env: Env, split_id: String, canceller: Address) -> Result<PaymentSplit, ContractError> {
        cancel_split(&env, split_id, canceller)
    }

    /// Retry failed distributions
    pub fn retry_failed_distributions(
        env: Env,
        split_id: String,
        retryer: Address,
    ) -> Result<PaymentSplit, ContractError> {
        retry_failed_distributions(&env, split_id, retryer)
    }

    /// Get split details
    pub fn get_split(env: Env, split_id: String) -> Result<PaymentSplit, ContractError> {
        get_split(&env, &split_id)
    }

    /// Get distribution details
    pub fn get_distribution(env: Env, distribution_id: String) -> Result<SplitDistribution, ContractError> {
        get_distribution(&env, &distribution_id)
    }

    /// Get contract configuration
    pub fn get_config(env: Env) -> SplitConfig {
        get_config(&env)
    }

    /// Update contract configuration (only admin)
    pub fn update_config(env: Env, _admin: Address, new_config: SplitConfig) -> Result<(), ContractError> {
        // In production, add proper admin authentication
        set_config(&env, &new_config);
        Ok(())
    }

    /// Verify a conditional split's condition
    pub fn verify_condition(env: Env, split_id: String, verifier: Address) -> Result<PaymentSplit, ContractError> {
        verify_condition(&env, split_id, verifier)
    }

    /// Release a time-locked split
    pub fn release_time_lock(env: Env, split_id: String, releaser: Address) -> Result<PaymentSplit, ContractError> {
        release_time_lock(&env, split_id, releaser)
    }

    /// Validate recursive split structure
    pub fn validate_recursive_structure(env: Env, split_id: String) -> Result<(), ContractError> {
        let mut visited_splits = Vec::new(&env);
        validate_recursive_structure(&env, &split_id, &mut visited_splits, 0)
    }

    /// Request a refund for a split
    pub fn request_refund(
        env: Env,
        refund_id: String,
        split_id: String,
        requester: Address,
        refund_amount: i128,
        reason: String,
    ) -> Result<RefundRequest, ContractError> {
        request_refund(&env, refund_id, split_id, requester, refund_amount, reason)
    }

    /// Approve a refund request (admin only)
    pub fn approve_refund(env: Env, refund_id: String, admin: Address) -> Result<RefundRequest, ContractError> {
        approve_refund(&env, refund_id, admin)
    }

    /// Complete a refund (after funds have been transferred)
    pub fn complete_refund(env: Env, refund_id: String) -> Result<RefundRequest, ContractError> {
        complete_refund(&env, refund_id)
    }

    /// Reject a refund request (admin only)
    pub fn reject_refund(env: Env, refund_id: String, admin: Address) -> Result<RefundRequest, ContractError> {
        reject_refund(&env, refund_id, admin)
    }

    /// Pause the contract (admin only)
    pub fn pause_contract(env: Env, admin: Address) -> Result<(), ContractError> {
        pause_contract(&env, admin)
    }

    /// Unpause the contract (admin only)
    pub fn unpause_contract(env: Env, admin: Address) -> Result<(), ContractError> {
        unpause_contract(&env, admin)
    }

    /// Check if contract is paused
    pub fn is_contract_paused(env: Env) -> bool {
        is_contract_paused(&env)
    }
}
