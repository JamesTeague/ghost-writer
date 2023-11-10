use std::error::Error;
use std::env;
use clap::Parser;
use rss::Channel;

use crate::commands::find; 

pub enum Command {
   Publish,
   Delete,
   Find,
   Watch,
}

impl From<&str> for Command {
   fn from(value: &str) -> Self {
       match value {
           "publish" => Command::Publish,
           "delete" => Command::Delete,
           "find" => Command::Find,
           "watch" => Command::Watch,
           _ => panic!("Invalid command: {}", value),
       }
   } 
}

#[derive(Parser)]
pub struct Cli {
    command: String
}

pub struct Config {
    pub ghost_url: String,
    pub ghost_api_key: String,
    pub rss_feed: String, 
    pub logo_url: Option<String>,
    pub polling_interval: Option<usize>,
    pub command: Command,
}

impl Config {
    pub fn build(args: Cli) -> Result<Config, &'static str> {
        if args.command.is_empty() {
            return Err("Command is required.");
        }
        
        let command = Command::from(args.command.as_str());
        let ghost_url = env::var("GHOST_URL").unwrap();
        let ghost_api_key = env::var("GHOST_API_KEY").unwrap();
        let rss_feed = env::var("RSS_FEED").unwrap();
        let logo_url = env::var("LOGO_URL").ok();
        let polling_interval;

        match env::var("POLLING_INTERVAL") {
            Ok(value) => polling_interval = value.parse::<usize>().ok(),
            Err(e) => { println!("couldn't interpret POLLING_INTERVAL: {}", e); polling_interval = None },
        }
        
        Ok(Config {
            ghost_url,
            ghost_api_key,
            rss_feed,
            logo_url,
            polling_interval,
            command,
        })
    }
    pub fn rss_feed(&self) -> &str {
        self.rss_feed.as_str()
    }
}

pub async fn parse(rss_feed: &str) -> Result<Channel, Box<dyn Error>> {
    let content = reqwest::get(rss_feed)
        .await?
        .bytes()
        .await?;


    let channel = Channel::read_from(&content[..])?;
    println!("hi");

    Ok(channel)
}

#[tokio::main]
async fn main() {
    let args = Cli::parse();
    let config = Config::build(args);

    if config.is_ok() {
        let config = config.unwrap();
        let channel = parse(&config.rss_feed()).await.unwrap();

        match config.command {
            Command::Find => println!("{}", find(&channel, String::from("Darren Woodson DESERVES a Gold Jacket!")).unwrap().description().unwrap()),
            _ => println!("not implemented yet.")
        }

//        println!("{}", find(&channel, String::from("Darren Woodson DESERVES a Gold Jacket!")).unwrap().description().unwrap())
    }
}
