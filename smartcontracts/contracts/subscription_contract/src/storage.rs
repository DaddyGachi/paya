use soroban_sdk::{Env, Address, String};
use crate::types::{DataKey, SubscriptionPlan, Subscription};

pub fn get_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get::<DataKey, Address>(&DataKey::Admin)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set::<DataKey, Address>(&DataKey::Admin, admin);
}

pub fn get_fee_percentage(env: &Env) -> Option<u64> {
    env.storage().instance().get::<DataKey, u64>(&DataKey::FeePercentage)
}

pub fn set_fee_percentage(env: &Env, fee: u64) {
    env.storage().instance().set::<DataKey, u64>(&DataKey::FeePercentage, &fee);
}

pub fn get_plan(env: &Env, plan_id: &String) -> Option<SubscriptionPlan> {
    env.storage()
        .instance()
        .get::<DataKey, SubscriptionPlan>(&DataKey::Plan(plan_id.clone()))
}

pub fn set_plan(env: &Env, plan_id: &String, plan: &SubscriptionPlan) {
    env.storage()
        .instance()
        .set::<DataKey, SubscriptionPlan>(&DataKey::Plan(plan_id.clone()), plan);
}

pub fn get_subscription(env: &Env, subscription_id: &String) -> Option<Subscription> {
    env.storage()
        .instance()
        .get::<DataKey, Subscription>(&DataKey::Subscription(subscription_id.clone()))
}

pub fn set_subscription(env: &Env, subscription_id: &String, subscription: &Subscription) {
    env.storage()
        .instance()
        .set::<DataKey, Subscription>(&DataKey::Subscription(subscription_id.clone()), subscription);
}

pub fn get_plan_counter(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get::<DataKey, u64>(&DataKey::PlanCounter)
        .unwrap_or(0)
}

pub fn increment_plan_counter(env: &Env) -> u64 {
    let counter = get_plan_counter(env) + 1;
    env.storage()
        .instance()
        .set::<DataKey, u64>(&DataKey::PlanCounter, &counter);
    counter
}

pub fn get_subscription_counter(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get::<DataKey, u64>(&DataKey::SubscriptionCounter)
        .unwrap_or(0)
}

pub fn increment_subscription_counter(env: &Env) -> u64 {
    let counter = get_subscription_counter(env) + 1;
    env.storage()
        .instance()
        .set::<DataKey, u64>(&DataKey::SubscriptionCounter, &counter);
    counter
}

pub fn is_emergency_pause(env: &Env) -> bool {
    env.storage()
        .instance()
        .get::<DataKey, bool>(&DataKey::EmergencyPause)
        .unwrap_or(false)
}

pub fn set_emergency_pause(env: &Env, paused: bool) {
    env.storage()
        .instance()
        .set::<DataKey, bool>(&DataKey::EmergencyPause, &paused);
}

pub fn has_subscription(env: &Env, customer: &Address, plan_id: &String) -> bool {
    let counter = get_subscription_counter(env);
    for i in 1..=counter {
        let subscription_id = crate::logic::u64_to_string(env, i);
        if let Some(sub) = get_subscription(env, &subscription_id) {
            if sub.customer == *customer && sub.plan_id == *plan_id {
                return true;
            }
        }
    }
    false
}
