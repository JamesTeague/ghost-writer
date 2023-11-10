use clap::Parser;
use reqwest::blocking::Client;
use std::fs;

/// Simple program to post podcast to podcast host
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Host API Key
    #[arg(short, long)]
    host_api_key: String,

    /// Ghost API Key
    #[arg(short, long)]
    audio_file_path: String,

    /// Podcast ID
    #[arg(short, long)]
    podcast_id: String,

    /// Podcast Title
    #[arg(short, long)]
    title: String,

    /// Podcast Description
    #[arg(short, long)]
    description: String,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Args::parse();

    // Specify the URL for the Buzzsprout API endpoint
    let url = format!("https://api.buzzsprout.com/v2/{}/episodes", cli.podcast_id);

    // Create a reqwest client
    let client = Client::new();

    let file_fs = fs::read(&cli.audio_file_path)?;
    let part = reqwest::blocking::multipart::Part::bytes(file_fs).file_name("recording.mp4");

    let form = reqwest::blocking::multipart::Form::new()
        .text("title", cli.title)
        .text("description", cli.description)
        .part("FileData", part);

    // Build the multipart request with file attachment
    let response = client
        .post(url)
        .bearer_auth(cli.host_api_key)
        .multipart(form)
        .send()?;

    // Check the response status
    if response.status().is_success() {
        println!("Episode posted successfully!");
    } else {
        println!("Error posting episode: {:?}", response.status());
        println!("{}", response.text()?); // Print the response body for further details
    }

    Ok(())
}
