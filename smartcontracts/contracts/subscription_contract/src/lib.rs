#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, String};

mod logic;
mod storage;
mod types;

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    pub fn initialize(env: Env, admin: Address, fee_percentage: u64) {
        logic::initialize(&env, admin, fee_percentage);
    }

    pub fn set_integration_contracts(
        env: Env,
        merchant_vault: Address,
        payment_registry: Address,
        caller: Address,
    ) -> Result<(), types::Error> {
        logic::set_integration_contracts(&env, merchant_vault, payment_registry, caller)
    }

    pub fn create_plan(
        env: Env,
        merchant: Address,
        amount: i128,
        interval: u64,
        max_cycles: Option<u32>,
    ) -> Result<String, types::Error> {
        logic::create_plan(&env, merchant, amount, interval, max_cycles)
    }

    pub fn subscribe(
        env: Env,
        customer: Address,
        plan_id: String,
    ) -> Result<String, types::Error> {
        logic::subscribe(&env, customer, plan_id)
    }

    pub fn process_billing(
        env: Env,
        subscription_id: String,
    ) -> Result<types::BillingEvent, types::Error> {
        logic::process_billing(&env, subscription_id)
    }

    pub fn cancel_subscription(
        env: Env,
        subscription_id: String,
        caller: Address,
    ) -> Result<(), types::Error> {
        logic::cancel_subscription(&env, subscription_id, caller)
    }

    pub fn pause_subscription(
        env: Env,
        subscription_id: String,
        caller: Address,
    ) -> Result<(), types::Error> {
        logic::pause_subscription(&env, subscription_id, caller)
    }

    pub fn resume_subscription(
        env: Env,
        subscription_id: String,
        caller: Address,
    ) -> Result<(), types::Error> {
        logic::resume_subscription(&env, subscription_id, caller)
    }

    pub fn get_subscription(
        env: Env,
        subscription_id: String,
    ) -> Result<types::Subscription, types::Error> {
        logic::get_subscription(&env, subscription_id)
    }

    pub fn get_plan(
        env: Env,
        plan_id: String,
    ) -> Option<types::SubscriptionPlan> {
        storage::get_plan(&env, &plan_id)
    }

    pub fn set_emergency_pause(
        env: Env,
        paused: bool,
        caller: Address,
    ) -> Result<(), types::Error> {
        logic::set_emergency_pause(&env, paused, caller)
    }

    pub fn is_emergency_pause(env: Env) -> bool {
        storage::is_emergency_pause(&env)
    }

    pub fn get_fee_percentage(env: Env) -> Option<u64> {
        storage::get_fee_percentage(&env)
    }

    pub fn get_admin(env: Env) -> Option<Address> {
        storage::get_admin(&env)
    }
}

#[cfg(test)]
mod test;
