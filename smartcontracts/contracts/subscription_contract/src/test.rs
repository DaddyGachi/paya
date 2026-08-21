#![cfg(test)]

use soroban_sdk::{Env, String};
use crate::logic;

#[test]
fn test_billing_cycle_calculation() {
    let _env = Env::default();
    
    let current_timestamp = 1000;
    let interval = 86400; // 1 day
    
    // Test cycle 0
    let next_billing = logic::calculate_next_billing(current_timestamp, interval, 0);
    assert_eq!(next_billing, current_timestamp + interval);
    
    // Test cycle 1
    let next_billing = logic::calculate_next_billing(current_timestamp, interval, 1);
    assert_eq!(next_billing, current_timestamp + (interval * 2));
    
    // Test cycle 5
    let next_billing = logic::calculate_next_billing(current_timestamp, interval, 5);
    assert_eq!(next_billing, current_timestamp + (interval * 6));
}

#[test]
fn test_u64_to_string() {
    let env = Env::default();
    
    // Test basic conversions
    assert_eq!(logic::u64_to_string(&env, 0), String::from_str(&env, "0"));
    assert_eq!(logic::u64_to_string(&env, 1), String::from_str(&env, "1"));
    assert_eq!(logic::u64_to_string(&env, 100), String::from_str(&env, "100"));
    assert_eq!(logic::u64_to_string(&env, 999), String::from_str(&env, "999"));
    assert_eq!(logic::u64_to_string(&env, 1000), String::from_str(&env, "1000"));
}
